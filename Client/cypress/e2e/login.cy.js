// Simple Cypress test for the login page
describe('Login Page Test', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('http://localhost:5173/login')
  })
  it('should display the login form', () => {
    // Check if the login form elements are visible
    cy.get('[data-cy="auth-username"]').should('be.visible')
    cy.get('[data-cy="auth-password"]').should('be.visible')
    cy.get('[data-cy="auth-submit-button"]').contains('Login').should('be.visible')
  })

  it('should allow entering username and password', () => {
    // Type into the form fields
    cy.get('[data-cy="auth-username"]').type('testuser')
    cy.get('[data-cy="auth-password"]').type('password123')
      // Verify that the text was entered
    cy.get('[data-cy="auth-username"]').should('have.value', 'testuser')
    cy.get('[data-cy="auth-password"]').should('have.value', 'password123')
  })

  it('should have a link to register', () => {
    // Check if there's a link to the registration page
    cy.get('[data-cy="auth-mode-switch"]').should('exist')
    cy.get('[data-cy="auth-mode-switch"]').contains('Register').should('exist')
  })
})
