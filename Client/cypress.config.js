import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      
    },
  },
});

// describe('Website Navigation Test', () => {
//   it('should visit the example website and verify the title', () => {
//     cy.visit('https://example.com'); // Visit the example website

//     // Find the h1 element and assert its text
//     cy.get('h1').should('have.text', 'Example Domain');
//   });
// });