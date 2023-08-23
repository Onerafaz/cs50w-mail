document.addEventListener('DOMContentLoaded', () => {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // On Compose submit, load sent box
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
  
  // Prevent the default form submission behavior
  event.preventDefault();
  
  // Call the first function
  load_mailbox('sent');

  // Call the second function
  send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Clear the emails view
  document.querySelector('#emails-view').innerHTML = '';

  // Fetch emails from API
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        const emailDiv = document.createElement('div');
        emailDiv.classList.add('email-box');

        if (!email.read) {
          emailDiv.classList.add('unread');
        }

        emailDiv.innerHTML = `
          <p>From: ${email.sender}</p>
          <p>Subject: ${email.subject}</p>
          <p>Timestamp: ${email.timestamp}</p>
          `;

          // Add click event to view the email details
          emailDiv.addEventListener('click', () => {
            // Logic to view the email details
            if (!email.read) {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  read: true
                })
              });
              // After reading the email, remove the class
              emailDiv.classList.remove('unread');
            }

            // Load the emails
            load_email_details(email.id);

          });

          document.querySelector('#emails-view').appendChild(emailDiv);
      });

    });

}
  
function send_email() {

// Send a POST request to the URL
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
});

}

function load_email_details(emailId) {
  // Clear the email view
  document.querySelector('#emails-view').innerHTML = '';

  // Fetch the email details by the ID
  fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
      const emailDetailsDiv = document.createElement('div');
      emailDetailsDiv.classList.add('email-details');

      emailDetailsDiv.innerHTML = `
        <p>From: ${email.sender}</p>
        <p>To: ${email.recipients.join(', ')}</p>
        <p>Subject: ${email.subject}</p>
        <p>Timestamp: ${email.timestamp}</p>
        <hr>
        <p>${email.body}</p>
      `;

      document.qu
    })
}