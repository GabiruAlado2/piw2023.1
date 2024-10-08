<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import SearchBar from '@/components/SearchBar.vue'
import { computed, onBeforeMount, onMounted } from 'vue'
import { ref } from 'vue'
import { api } from '@/api'
import type { User } from '@/types'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  name: String,
  admin: Boolean,
  buttonLabel: String,
  buttonLink: String
})

const users = ref([] as User[])
const userToRemove = ref<User>()
const deleteRequested = ref(false)
const userStore = useUserStore()
const admin = computed(() => props.admin )
const link = ref(String(props.buttonLink) || '')

const showError = ref(false)
const message = ref('')

async function toggleMessage() {
  showError.value = !showError.value
}

async function askToDelete(id: string) {
  const index = users.value.findIndex((u) => u.id === id)
  userToRemove.value = users.value[index]
  toggleModal()
}

async function removeUser() {
  try {
    const res = await api.delete(`/users/${userToRemove.value?.id}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    const removedUser: User = res.data.data
    const toRemove = users.value.findIndex((u) => removedUser.id == u.id)
    users.value.splice(toRemove, 1)
    alert("Usuário excluído com sucesso.")
  } catch (error) {
    toggleMessage()
    message.value = 'Não foi possível excluir o usuário.'
  } finally {
    toggleModal()
  }
}

async function toggleModal() {
  deleteRequested.value = !deleteRequested.value
}

const searchItem = ref('')
function filteredList() {
  return users.value.filter((user)=>
    user.name.toLowerCase().includes(searchItem.value.toLowerCase())
  )
}

onMounted(async () => {
  try {
    let data
    if (admin.value) {
      data = await api.get('/users', {
        params: { isAdmin: true },
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    }
    else {
      data = await api.get('/users', {
        params: { isAdmin: false },
        headers: { Authorization: `Bearer ${userStore.token}`}
      })
    }
    users.value = data.data.data
  } catch (error) {
    console.log(error)
    toggleMessage()
    message.value = 'Usuários não encontrados.'
  }
})
</script>

<template>
  <main>
    <NavBar></NavBar>
    <div class="container">
      <div class="content">
        <SectionHeader :pageName="name"></SectionHeader>
        <div class="panel" id="sectionOptions">
          <!-- <SearchBar /> -->
          <form class="searchform">
            <input class="searchinput" type="text" v-model="searchItem" placeholder="Buscar fichamentos" />
            <button type="submit" class="btn-icon btn-plain searchbutton">
              <span class="material-symbols-outlined"> search </span>
            </button>
          </form>
          <div class="holder">
            <RouterLink :to="`/${link}/novo`" as="button">
              <button class="btn-primary">
                <span class="material-symbols-outlined">add</span>
                {{ buttonLabel }}
              </button>
            </RouterLink>
          </div>
        </div>
        <div class="panel">
          <table>
            <thead>
              <td class="body2">Nome</td>
              <td class="body2">E-mail</td>
              <td class="body2">Nome de usuário</td>
              <td class="body2">Ações</td>
            </thead>
            <tr v-for="user in filteredList()">
              <td class="body1">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.username }}</td>
              <td class="hold">
                <div class="holder">
                  <RouterLink :to="`/${link}/${user.id}`">
                    <button class="btn-icon-sm">
                      <span class="material-symbols-outlined"> edit </span>
                    </button>
                  </RouterLink>
                  <button @click="askToDelete(user.id)" class="btn-icon-sm btn-negative">
                    <span class="material-symbols-outlined"> delete </span>
                  </button>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </main>

  <div class="modal" v-if="deleteRequested">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Remover usuário</h5>
          <button @click="deleteRequested = false" class="btn-icon btn-icon-sm btn-plain">
            <span class="material-symbols-outlined"> close </span>
          </button>
        </div>

        <div class="modal-body">
          <p class="body1">
            O usuário <strong>{{ userToRemove?.name }}</strong> será removido. Esta ação não pode
            ser desfeita, tem certeza de que deseja continuar?
          </p>
        </div>

        <div class="modal-footer">
          <button @click="deleteRequested = false" class="btn-secondary">Voltar</button>
          <button @click="removeUser" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  overflow-y: scroll;
}



</style>
