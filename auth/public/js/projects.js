new Vue({
    el: '#contents',
    data: {
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
        ]
    },

    mounted: async function () {
        console.log(this.$cookies.get('photo'))
        console.log(this.$cookies.get('email'))
        console.log(this.$cookies.get('name'))
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
        console.log(response)
    },

    methods: {
        $request_create_project: async function (title, desc) {
            return await this.$http.post
                (
                    'api/project/make',
                    {
                        title: title,
                        desc: desc
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_created_project: function (id, name, desc) {
            this.projects.push({
                summary: `Lorem ipsum_${id}`,
                name: name,
                desc: desc,
                mine: true
            })
        },

        $request_remove_project: async function (id) {
            return await this.$http.post
                (
                    `api/project/remove/${id}`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_remove_project: function (id) {

            const found = this.projects.findIndex(x => x.id == id)
            if (found != -1)
                this.projects.splice(found, 1)
        },

        show_create_popup: async function () {
            const handle_request = this.$request_create_project
            const handle_update = this.$update_created_project

            const result = await swal.fire({
                title: '섹션을 추가합니다..ㅎ',
                html:
                    '<input id="project-title" class="swal2-input" placeholder="Title">' +
                    '<input id="project-desc" class="swal2-input" placeholder="Description">',
                showCancelButton: true,
                confirmButtonText: 'Register',
                showLoaderOnConfirm: true,
                preConfirm: async () => {

                    try {
                        const title = document.getElementById('project-title').value
                        if (title.length == 0)
                            throw 'project title cannot be empty.'

                        const desc = document.getElementById('project-desc').value
                        if (desc.length == 0)
                            throw 'project description cannot be empty.'

                        return handle_request(title, desc)
                    } catch (e) {
                        swal.showValidationMessage(`Request failed : ${e}`)
                    }
                },
                allowOutsideClick: () => !swal.isLoading()
            })

            const response = result.value.body
            if (response.success) {
                handle_update(response.project.id, response.project.name, response.project.desc)
                swal.fire({
                    icon: 'success',
                    title: 'Request success',
                    text: `You create project '${response.project.name}'.`
                })
            } else {
                swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Request failed. Check message : ${response.error}`
                })
            }
        },

        remove: async function (id) {
            const handle_request = this.$request_remove_project
            const handle_update = this.$update_remove_project

            const result = await swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    return await handle_request(id)
                },
                allowOutsideClick: () => !swal.isLoading()
            })

            const response = result.value
            if (response.body.success) {
                handle_update(id)
                await swal.fire({
                    icon: 'success',
                    title: 'Remove success',
                    text: `-_ㅡ`
                })
            } else {
                swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Request failed. Check message : ${response.error}`
                })
            }
        }
    }
})