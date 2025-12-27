




const mapBox = document.getElementById('map');
if (mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

const logOutBtn = document.querySelector('.nav__el--logout');




///values



if (loginForm){
    loginForm.addEventListener('submit', e =>{
        e.preventDefault();
    const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        login(email,password);
    });
};

if (userDataForm){
    userDataForm.addEventListener('submit', e =>{
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo',document.getElementById('photo').files[0]);


    
        
        updateAccount(form,'data');
    });
};

if (userPasswordForm){
    userPasswordForm.addEventListener('submit', async e =>{
        e.preventDefault();
        document.querySelector('.btn-save-password').textContent= 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
        
       await updateAccount({passwordCurrent,password,passwordConfirm},'password');
       document.getElementById('password-current').value = '';
       document.getElementById('password').value = '';
       document.getElementById('password-confirm').value = '';
       document.querySelector('.btn-save-password').textContent= 'Save Password';
    });
};
if(logOutBtn) logOutBtn.addEventListener('click',logout);

if(bookBtn)
    bookBtn.addEventListener('click', e =>{
        e.target.textContent = 'processing...';
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    });