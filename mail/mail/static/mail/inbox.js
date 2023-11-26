document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {


    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content').style.display = 'none';


    // Show the mailbox name
    document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Get the emails for that mailbox and user
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(singleEmail => {
          

          console.log(singleEmail);

          const new_email = document.createElement('div');
          
          new_email.innerHTML = `
              <a href="#" id="link_selection" class="list-group-item list-group-item-action">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1" style="font-weight: bold";>${singleEmail.sender}</h5>
                <small>${singleEmail.timestamp}</small>
              </div>
              <p class="mb-1">To: ${singleEmail.recipients}</p>
              <small>${singleEmail.subject}</small>
            </a>
          `;
        
          new_email.addEventListener('click', function() {
            if (mailbox === 'inbox')
              fetch(`/emails/${singleEmail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  read: true
                })
              });
              view_email(singleEmail.id)
          });
          
          if (singleEmail.read) {
            new_email.classList.add('isread')
          }
          else {
            new_email.classList.add('unread')
          }

          document.querySelector("#emails-view").append(new_email);

        })
    });
  };

function send_email() {
  

  // Store input values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch("/emails", {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
  
}

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content').style.display = 'block';
    
    document.querySelector('#email-content').innerHTML = `
    <hr>
    <ul class="list-group">
      <li><strong>From:</strong> ${email.sender}</li>
      <li><strong>To:</strong> ${email.recipients}</li>
      <li><strong>Subject:</strong> ${email.subject}</li>
      <li><strong>Timestamp:</strong> ${email.timestamp}</li>
    </ul>
    <button id="reply" class="btn btn-sm btn-outline-primary">Reply</button>
    <button id="archieve" class="btn btn-sm btn-outline-primary">Archieve</button>
    <hr>
    ${email.body}
    `
  });
}
