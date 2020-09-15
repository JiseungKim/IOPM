window.onload = () => {

    new Vue({
        el: '#app',
        mounted: function () {
            const [access, refresh] = [this.$cookies.get('access token'), this.$cookies.get('refresh token')]
            console.log(access, refresh)
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

                    const { access, refresh } = response.data.tokens
                    this.$cookies.set('access token', access)
                    this.$cookies.set('refresh token', refresh)
                    window.location.href = '/team'
                } catch (e) {
                    console.error(e)
                }
            },

            facebook: async function () {
                try {
                    const provider = new firebase.auth.FacebookAuthProvider();
                    const result = await firebase.auth().signInWithPopup(provider)
                    const token = result.credential.accessToken
                    const user = result.user
                } catch (e) {
                    if (e.code != 'auth/popup-closed-by-user')
                        alert(e.message)
                }
            }
        }
    })
}