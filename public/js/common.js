console.log('common js');

const logoutButton = document.querySelector('#logoutBtn');

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      alert('User logged out successfully');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message);
  }
};

logoutButton.addEventListener('click', logout);
