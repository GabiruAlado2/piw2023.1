<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import { computed, onMounted, ref } from 'vue'
import type { Annotation } from '@/types'
import { api } from '@/api'
import { useUserStore } from '@/stores/userStore'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  name: String,
  title: String, 
  link: String,
  showOptions: Boolean,
  showCardOptions: Boolean,
  home: Boolean
})

const annotations = ref([] as Annotation[])
const userStore = useUserStore()
const router = useRouter()

const annotationToRemove = ref<Annotation>()
const annotationToClone = ref<Annotation>()
const deleteRequested = ref(false)
const cloneRequested = ref(false)
const home = computed(() => props.home)


async function fetchAnnotations() {
  try {
    let data
    if (home.value) {
      data = await api.get('/annotations', {
        params: { isPublic: true },
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    } else {
      const params = { user: { id: userStore.user.id } }
      data = await api.get('/annotations', {
        params: params,
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
    }
    annotations.value = data.data.data
  } catch (e) {
    console.log(e)
  }
}

const searchItem = ref('')
function filteredList() {
  return annotations.value.filter((annotation)=>
    annotation.workTitle.toLowerCase().includes(searchItem.value.toLowerCase())
  )
}

async function askToDelete(id: string) {
  const index = annotations.value.findIndex((u) => u.id === id)
  annotationToRemove.value = annotations.value[index]
  toggleModal()
}

async function removeAnnotation() {
  try {
    const res = await api.delete(`/annotations/${annotationToRemove.value?.id}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    const removedUser: Annotation = res.data
    const toRemove = annotations.value.findIndex((u) => removedUser.id == u.id)
    annotations.value.splice(toRemove, 1)
    alert("Fichamento excluído com sucesso.")
  } catch (error) {
    console.log(error)
  } finally {
    toggleModal()
  }
}

async function askToClone(id: string) {
  const index = annotations.value.findIndex((u) => u.id === id)
  annotationToClone.value = annotations.value[index]
  toggleCloneModal()
}

async function cloneAnnotation() {
  try {
    const res = await api.post(
      `/annotations`,
      {
        userId: userStore.user.id,
        creatorUsername: annotationToClone.value?.creatorUsername,
        isPublic: false,
        workTitle: annotationToClone.value?.workTitle,
        workAuthors: annotationToClone.value?.workAuthors
      },
      { headers: { Authorization: `Bearer ${userStore.token}` } }
    )
    alert("Fichamento clonado com sucesso.")
    router.push(`/fichamentos/${res.data.data.id}/citacoes`)
  } catch (error: any) {
    console.log(error)
  }
}

async function toggleModal() {
  deleteRequested.value = !deleteRequested.value
}

async function toggleCloneModal() {
  cloneRequested.value = !cloneRequested.value
}

onMounted(async () => {
  try {
    fetchAnnotations()
  } catch (e) {
    console.log(e)
  }
})
</script>

<template>
  <main>
    <NavBar></NavBar>
    <div class="container">
      <div class="content">
        <SectionHeader :pageName="name"></SectionHeader>
        <div v-if="showOptions" class="panel" id="sectionOptions">
          <form class="searchform">
            <input class="searchinput" type="text" v-model="searchItem" placeholder="Buscar fichamentos" />
            <button type="submit" class="btn-icon btn-plain searchbutton">
              <span class="material-symbols-outlined"> search </span>
            </button>
          </form>
          <div class="holder">
            <RouterLink to="/fichamentos/novo" as="button">
              <button class="btn-primary">
                <span class="material-symbols-outlined">add</span>
                Novo fichamento
              </button>
            </RouterLink>
          </div>
        </div>
        <div class="grid-list">
          <div v-for="annotation in filteredList()">
            <div class="card">
              <RouterLink :to="`/${link}/${annotation.id}/citacoes`"
                ><h3>{{ annotation.workTitle }}</h3>
              </RouterLink>
              <p class="body1" style="align-self: stretch">{{ annotation.workAuthors }}</p>
              <div class="footer">
                <ul>
                  <li v-if="annotation.creatorUsername == userStore.user?.username" class="body2">
                    Por <strong>você</strong>
                  </li>
                  <li v-else class="body2">
                    Por <strong>{{ annotation.creatorUsername }}</strong>
                  </li>
                </ul>
                <div class="holder">
                  <RouterLink :to="`/fichamentos/${annotation.id}/citacoes`">
                    <button class="btn-icon-sm">
                      <span class="material-symbols-outlined"> visibility </span>
                    </button>
                  </RouterLink>
                  <button
                    @click="askToClone(annotation.id)"
                    v-if="!showCardOptions && userStore.user?.id"
                    class="btn-icon-sm"
                  >
                    <span class="material-symbols-outlined"> file_copy </span>
                  </button>
                  <RouterLink v-if="showCardOptions" :to="`/fichamentos/${annotation.id}/editar`">
                    <button class="btn-icon-sm">
                      <span class="material-symbols-outlined"> edit </span>
                    </button>
                  </RouterLink>
                  <button
                    v-if="showCardOptions"
                    @click="askToDelete(annotation.id)"
                    class="btn-negative btn-icon-sm"
                  >
                    <span class="material-symbols-outlined"> delete </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            O fichamendo da obra <strong>{{ annotationToRemove?.workTitle }}</strong> será removido
            junto de todas as suas citações. Esta ação não pode ser desfeita, tem certeza de que
            deseja continuar?
          </p>
        </div>

        <div class="modal-footer">
          <button @click="deleteRequested = false" class="btn-secondary">Voltar</button>
          <button @click="removeAnnotation" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" v-if="cloneRequested">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Remover usuário</h5>
          <button @click="cloneRequested = false" class="btn-icon btn-icon-sm btn-plain">
            <span class="material-symbols-outlined"> close </span>
          </button>
        </div>

        <div class="modal-body">
          <p class="body1">
            Deseja clonar o fichamento da obra <strong>{{ annotationToClone?.workTitle }}</strong
            >?
          </p>
        </div>

        <div class="modal-footer">
          <button @click="cloneRequested = false" class="btn-secondary">Voltar</button>
          <button @click="cloneAnnotation()" class="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  overflow-y: scroll;
}

span {
  transform: scale(75%);
}

h3 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-self: stretch;
}

.card a {
  align-self: stretch;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0.5rem;
  align-self: stretch;
}

li {
  margin: 0;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-self: stretch;
}
</style>
