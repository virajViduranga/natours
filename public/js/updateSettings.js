 /*eslint-disable */

 // type is either password or data
const updateAccount = async (data,type) => {
  try {

    const url = type ==='password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe'
    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data
    });

    if (res.data.status === 'success') {
      alert(`${type.toUpperCase()} Data Updated Successfully!`);
      
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};