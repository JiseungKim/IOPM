new Vue({
    el: '#contents',
    data: {
        show_create_project_dialog: false,
        role: 'members',
        projects: [
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                summary: 'Lorem ipsum',
                name: 'Lorem ipsum',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            }
        ],
        create_params: {
            title: '',
            desc: ''
        }
    },

    mounted: async function () {
        const response = await this.$http.get
            (
                'api/project/get',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

        if (response.body.success)
            this.projects = response.body.projects
        console.log(this.projects)
    },

    methods: {
        show_create_popup: async function () {
            this.show_create_project_dialog = true
            this.create_params.title = 'sample title'
            this.create_params.desc = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },

        create_project: async function (data) {
            this.show_create_project_dialog = false
            this.create_params.title = ''
            this.create_params.desc = ''

            try {
                const response = await this.$http.post
                    (
                        'api/project/make',
                        data,
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )

                if (response.data.success == false)
                    throw response.data.error

                console.log(response.data)
                this.projects.push({
                    summary: 'Lorem ipsum',
                    name: response.data.project.name,
                    desc: response.data.project.desc
                })
            } catch (e) {
                alert(e)
            }
        }
    }
})