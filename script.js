
const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const form = document.getElementById('form')
const aiResponse = document.getElementById('aiResponse')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

aiSearch = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash"
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}` 
  const ask = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo ${game}
  
  ## Tarefa
  Voce deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

  ## Regras
  - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
  - Se a pergunta não estiver relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
  - Considere a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

  ## Resposta
  - Economize na resposta, seja direto e responda no máximo 500 caracteres.
  - Não precisa de saudação ou despedida, apenas responda o que o uruário está querendo.

  ## Exemplo de resposta
  pergunta do usuário: Melhor build Twitch jungle
  resposta: A build mais atual é: \n\n **Runas:** \n\n coloque os itens aqui. \n\n **Itens:** \n\n exemplo de runas \n\n

  ---
  Aqui está a pergunta do usuário: ${question}
  `

  const contents = [{
    role: "user",
    parts: [{
      text: ask
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const question = questionInput.value
  const game = gameSelect.value

  if (apiKey == '' || question == '' || game == ''){
    alert('Por favor, preencha todos os campos')
    return
  }
  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await aiSearch(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } catch(error){
    console.log('Erro: ', error)
  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove('loading')
  }
  
}
form.addEventListener('submit', sendForm)
