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
        sign_in: async function (social) {
            let provider = null
            if (social == 'google')
                provider = new firebase.auth.GoogleAuthProvider()
            else if (social == 'facebook')
                provider = new firebase.auth.FacebookAuthProvider()
            else
                return

            const result = await firebase.auth().signInWithPopup(provider)
            const token = await result.user.getIdToken()
            const response = await this.$http.post
                (
                    'auth/authenticate',
                    { token: token },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

            if (response.data.success == false)
                throw response.error

            window.location.href = '/project'
        }
    }
})