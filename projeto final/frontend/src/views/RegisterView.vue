<script setup lang="ts">
import { api } from '@/api'
import { ref } from 'vue'
import type { User } from '@/types'
import { useRouter } from 'vue-router'

const user = ref({} as User)
const router = useRouter()
const showError = ref(false)
const message = ref('')

async function toggleMessage() {
  showError.value = !showError.value
}

async function createUser() {
  try {
    const res = await api.post(`/register`, {
      name: user.value.name,
      email: user.value.email,
      username: user.value.username,
      password: user.value.password
    })
    user.value = res.data
    alert("Conta criada! faça login para continuar.")
    router.push('/fichamentos')
  } catch (error) {
    console.log(error)
    toggleMessage()
    message.value = 'Dados obrigatórios não adicionados.'
  }
}
</script>

<template>
  <div class="container">
    <div class="panel">
      <div class="titleandsubtitle">
        <h1>Boas-vindas!</h1>
        <p>Crie uma conta e comece o seu fichário particular.</p>
      </div>

      <form name="registerForm" @submit.prevent="createUser()">
        <div class="grid-list">
          <div class="inputsection">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model="user.name" />
          </div>

          <div class="inputsection">
            <label for="email">E-mail</label>
            <input type="text" id="email" v-model="user.email" />
          </div>

          <div class="inputsection">
            <label for="username">Nome de usuário</label>
            <input type="text" id="username" v-model="user.username" />
          </div>

          <div class="inputsection">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="user.password" />
          </div>
        </div>

        <button class="btn-primary" type="submit" name="login" method="post">Criar conta</button>
      </form>

      <div class="footer">
        <p class="body2 centered">ou</p>
        <RouterLink to="/login">
          <button class="btn-plain">Fazer login</button>
        </RouterLink>
      </div>
    </div>
  </div>

  <div class="non-modal" v-if="showError">
    <div class="non-modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Erro</h5>
          <button @click="toggleMessage()" class="btn-icon btn-icon-sm btn-plain">
            <span class="material-symbols-outlined"> close </span>
          </button>
        </div>

        <div class="modal-body">
          <p class="body1">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
}

.panel {
  min-width: none;
  align-self: auto;
  width: 400px;
  /* align-self: stretch; */
}

.footer {
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.footer a {
  display: flex;
  align-self: stretch;
}

.footer button {
  flex: 1 0 0;
}
</style>
