// Cypress test for the register functionality
describe('Register Page Test', () => {  beforeEach(() => {
    // Visit the login page and switch to register mode
    cy.visit('http://localhost:5173/login')
    cy.get('[data-cy="auth-mode-switch"]').click()
  })

  it('should switch to register form', () => {
    // Verify we're on the register form by checking for register-specific fields
    cy.get('[data-cy="register-name"]').should('be.visible')
    cy.get('[data-cy="register-email"]').should('be.visible')
    cy.get('[data-cy="auth-username"]').should('be.visible')
    cy.get('[data-cy="auth-password"]').should('be.visible')
    cy.get('[data-cy="register-confirm-password"]').should('be.visible')
    cy.get('[data-cy="auth-submit-button"]').contains('Register').should('be.visible')
  })
  it('should allow entering registration details', () => {
    // Fill out the registration form
    cy.get('[data-cy="register-name"]').type('Test User')
    cy.get('[data-cy="register-email"]').type('test@example.com')
    cy.get('[data-cy="auth-username"]').type('newuser123')
    cy.get('[data-cy="auth-password"]').type('password123')
    cy.get('[data-cy="register-confirm-password"]').type('password123')
    
    // Verify that the text was entered
    cy.get('[data-cy="register-name"]').should('have.value', 'Test User')
    cy.get('[data-cy="register-email"]').should('have.value', 'test@example.com')
    cy.get('[data-cy="auth-username"]').should('have.value', 'newuser123')
    cy.get('[data-cy="auth-password"]').should('have.value', 'password123')
    cy.get('input[placeholder="Confirm Password"]').should('have.value', 'password123')
  })

  it('should validate password match', () => {
    // Fill out the registration form with mismatched passwords
    cy.get('input[placeholder="Full Name"]').type('Test User')
    cy.get('input[placeholder="Email"]').type('test@example.com')
    cy.get('input[placeholder="Username"]').type('newuser123')
    cy.get('input[placeholder="Password"]').type('password123')
    cy.get('input[placeholder="Confirm Password"]').type('different123')
    
    // Submit form - in a real test, we'd intercept the API call
    // Here we're just checking form validation
    cy.contains('button[type="submit"]', 'Register').click()
    
    // Check for an error message
    cy.contains('Passwords do not match').should('be.visible')
  })

  it('should allow switching back to login', () => {
    // Check if there's a link to switch back to login
    cy.contains('Login').click()
    
    // Verify we're back to login form
    cy.get('input[placeholder="Full Name"]').should('not.exist')
    cy.get('input[placeholder="Email"]').should('not.exist')
    cy.contains('button[type="submit"]', 'Login').should('be.visible')
  })

  it('should attempt to register a new user', () => {
    // Setup a mock server response
    cy.intercept('POST', 'http://localhost:4000/auth/register', {
      statusCode: 201,
      body: { 
        message: 'User registered successfully'
      }
    }).as('registerRequest')
    
    // Fill out the registration form
    cy.get('input[placeholder="Full Name"]').type('Test User')
    cy.get('input[placeholder="Email"]').type('test@example.com')
    cy.get('input[placeholder="Username"]').type('newuser123')
    cy.get('input[placeholder="Password"]').type('password123')
    cy.get('input[placeholder="Confirm Password"]').type('password123')
    
    // Submit form
    cy.contains('button[type="submit"]', 'Register').click()
    
    // Wait for the request and verify it was sent
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.request.body).to.have.property('username', 'newuser123')
      expect(interception.request.body).to.have.property('password', 'password123')
      expect(interception.request.body).to.have.property('name', 'Test User')
      expect(interception.request.body).to.have.property('email', 'test@example.com')
    })
    
    // After successful registration, we should be redirected to login
    cy.contains('button[type="submit"]', 'Login').should('be.visible')
  })
})
