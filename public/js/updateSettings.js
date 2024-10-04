// import axios from 'axios';
const form = document.querySelector('.form-user-data');

const updateUserData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: { name, email }, // data will be the req.body
    });

    if (res.data.status === 'success') {
      alert('User data changed successfully');
      console.log(res.data);
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.querySelector(
    '.form-user-data #name'
  ).value;
  const email = document.querySelector(
    '.form-user-data #email'
  ).value;

  console.log(email, name);

  updateUserData(name, email);
});
