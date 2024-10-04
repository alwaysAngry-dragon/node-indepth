// import axios from 'axios';
const form = document.querySelector('.form');

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signin',
      data: { email, password }, // data will be the req.body
    });

    if (res.data.status === 'success') {
      alert('User signed in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.querySelector('#email').value;
  const password =
    document.querySelector('#password').value;

  login(email, password);
});
