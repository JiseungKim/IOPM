window.onload = () => {

    new Vue({
        el: '#app',
        mounted: function () {
            firebase.initializeApp(this.fb_config)
        },
        data: {
            fb_config: {
                apiKey: "AIzaSyA-hJE_QQFzL-WE-Uh_trAna1T-QWiVzSY",
                authDomain: "iopm-f7940.firebaseapp.com",
                databaseURL: "https://iopm-f7940.firebaseio.com",
                projectId: "iopm-f7940",
                storageBucket: "iopm-f7940.appspot.com",
                messagingSenderId: "1023271851765",
                appId: "1:1023271851765:web:b5412943d2ac6b634d57bc"
            }
        },
        methods: {
            google: async function () {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    const result = await firebase.auth().signInWithPopup(provider)
                    const token = result.credential.idToken
                    console.log(token)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    })
}