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
                desc: desc
            })
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
        }
    }
})