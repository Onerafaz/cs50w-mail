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

  // Pre-fill the form fields
  document.querySelector('#compose-recipients').value = options.recipients || '';
  document.querySelector('#compose-subject').value = options.subject || '';
  document.querySelector('#compose-body').value = options.body || '';
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

        // Create Archive/Unarchive button based on email's archived status
        const archiveButton = document.createElement('button');
        archiveButton.textContent = email.archived ? 'Unarchive' : 'Archive';
        archiveButton.classList.add('btn', 'btn-sm', 'btn-primary');
        archiveButton.addEventListener('click', () => {
          // Toggle the archived status
          const newArchivedStatus = !email.archived;

          // Update the email's archived status on the server
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: newArchivedStatus
            })
          }).then(() => {
            // After archiving/un-archiving, reload the user's inbox
            load_mailbox('inbox');
          });
        });

        emailDiv.appendChild(archiveButton);

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

  let email; // Define the email variable in a broader scope

  // Fetch the email details by the ID
  fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(data => {
      email = data; // Assign the email data to the broader scope variable

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

      document.querySelector('#emails-view').appendChild(emailDetailsDiv);

      // Create Reply button
      const replyButton = document.createElement('button');
      replyButton.textContent = 'Reply';
      replyButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'mr-2');
      replyButton.addEventListener('click', () => {
        // Load the composition form for replying
        compose_email({
          recipients: [email.sender],  // Pre-fill recipient field
          subject: email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
          body: `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`
        });
      });

      emailDetailsDiv.appendChild(replyButton); // Append reply button here
    });
}
