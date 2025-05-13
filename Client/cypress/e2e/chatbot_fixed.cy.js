// Cypress test for the chatbot functionality
describe('Chatbot Test', () => {
  beforeEach(() => {
    // Load test data from fixtures
    cy.fixture('chatbot.json').as('chatbotData')
    
    // Setup a fake token to simulate being logged in
    localStorage.setItem('token', 'fake-token-for-testing')
    
    // Mock the chat history request
    cy.intercept('GET', 'http://localhost:4000/chats', (req) => {
      cy.get('@chatbotData').then((data) => {
        req.reply({
          statusCode: 200,
          body: data.chatHistory
        })
      })
    }).as('getChatHistory')
    
    // Visit the main app page
    cy.visit('http://localhost:5173/')
  })

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.removeItem('token')
  })

  it('should display the chat interface when logged in', () => {
    // Check if the chat interface is visible
    cy.get('[data-cy="chat-form"]').should('be.visible')
    cy.get('[data-cy="chat-input"]').should('be.visible')
    cy.get('[data-cy="send-button"]').should('be.visible')
  })

  it('should allow entering a message', () => {
    // Type a message in the input field
    cy.get('[data-cy="chat-input"]').type('Tell me about quantum computing')
    cy.get('[data-cy="chat-input"]').should('have.value', 'Tell me about quantum computing')
  })

  it('should send a message and show AI responses', () => {
    // Mock the chat API response
    cy.get('@chatbotData').then((data) => {
      cy.intercept('POST', 'http://localhost:4000/chat', {
        statusCode: 200,
        body: data.mockResponses.mathHelp
      }).as('chatRequest')
    })
    
    // Type and submit a message
    cy.get('[data-cy="chat-input"]').type('How do I solve algebraic equations?')
    cy.get('[data-cy="send-button"]').click()
    
    // Verify that the request was made
    cy.wait('@chatRequest').then((interception) => {
      expect(interception.request.body).to.have.property('message', 'How do I solve algebraic equations?')
    })
    
    // Check that responses are displayed
    cy.get('[data-cy="ai-response"]').should('be.visible')
    cy.contains('When approaching algebraic equations').should('be.visible')
    cy.contains('For example, to solve 2x + 3 = 7').should('be.visible')
  })

  it('should handle loading state while waiting for response', () => {
    // Mock the chat API with a delayed response
    cy.intercept('POST', 'http://localhost:4000/chat', {
      statusCode: 200,
      body: {
        message1: 'AI Response 1: This is a delayed response',
        message2: 'AI Response 2: Testing loading indicators'
      },
      delay: 1000 // Add a 1 second delay
    }).as('chatRequest')
    
    // Type and submit a message
    cy.get('[data-cy="chat-input"]').type('Test loading state')
    cy.get('[data-cy="send-button"]').click()
    
    // Check for loading indicators
    cy.get('[data-cy="loading-indicator"]').should('be.visible')
    
    // After response arrives, loading should be gone
    cy.wait('@chatRequest')
    cy.get('[data-cy="loading-indicator"]').should('not.exist')
  })
  
  it('should show chat history when clicking history tab', () => {
    // Wait for the chat history to load
    cy.wait('@getChatHistory')
    
    // Click on the history tab
    cy.get('[data-cy="history-tab"]').click()
    
    // Verify chat history is displayed
    cy.get('[data-cy="chat-history-container"]').should('be.visible')
    cy.get('[data-cy="history-item"]').should('have.length.at.least', 1)
  })

  it('should handle errors from the API', () => {
    // Mock an error response from the API
    cy.intercept('POST', 'http://localhost:4000/chat', {
      statusCode: 500,
      body: {
        error: 'Server error occurred'
      }
    }).as('errorRequest')
    
    // Type and submit a message
    cy.get('[data-cy="chat-input"]').type('This will cause an error')
    cy.get('[data-cy="send-button"]').click()
    
    // Wait for the error response
    cy.wait('@errorRequest')
    
    // Check that the error message is displayed
    cy.get('[data-cy="error-message"]').should('be.visible')
    cy.contains('Server error occurred').should('be.visible')
  })

  it('should allow logging out', () => {
    // Find and click the logout button
    cy.get('[data-cy="logout-button"]').click()
    
    // After logout, we should see the login form
    cy.get('[data-cy="auth-username"]').should('be.visible')
    cy.get('[data-cy="auth-password"]').should('be.visible')
    
    // Token should be removed from localStorage
    cy.window().its('localStorage.token').should('be.undefined')
  })
})
