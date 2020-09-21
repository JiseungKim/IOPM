function current_project_name() {
    try {
        const re = new RegExp('^\/project\/(?<name>.*)$')
        const match = re.exec(window.location.pathname)
        return decodeURI(match.groups.name)
    } catch (e) {
        alert(e)
        return null
    }
}

new Vue({
    el: '#contents',
    data: {
        project: 0,
        mine: false,
        sections: {}
    },
    mounted: async function () {
        try {
            const response = await this.$http.get
                (
                    `../api/todo/find_by_project/${current_project_name()}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

            if (response.data.success == false)
                throw response.data.error

            console.log(response.data)
            this.sections = response.data.sections
            this.mine = response.data.mine
        } catch (e) {
            alert(e)
        }
    },
    methods: {
        $request_create_section: async function (name) {
            return await this.$http.post
                (
                    '../api/section/make',
                    {
                        name: name,
                        project: current_project_name()
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_created_section: function (id, name) {
            // 바로 업데이트가 안됨 이유를 모르겠음
            this.sections.push({ id: id, name: name, todo_list: [] })
        },

        $request_create_todo: async function (title, desc, section) {
            return await this.$http.post
                (
                    '../api/todo/make',
                    {
                        title: title,
                        desc: desc,
                        section: section
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_created_todo: function (id, title, desc, section_id) {

            console.log(this.sections.find)
            const found = this.sections.find(x => x.id == section_id)
            if (found == null)
                throw 'unknown exception'

            found.todo_list.push({
                id: id,
                title: title,
                description: desc,
                mine: true
            })
            console.log(found.todo_list)
        },

        $request_remove_todo: async function (id) {
            return await this.$http.post
                (
                    `../api/todo/remove/${id}`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_remove_todo: function (id) {
            for (let section of this.sections) {
                const found = section.todo_list.findIndex(x => x.tid == id)
                if (found == -1)
                    continue

                section.todo_list.splice(found, 1)
                return true
            }
            return false
        },

        $request_remove_section: async function (id) {
            return await this.$http.post
                (
                    `../api/section/remove/${id}`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        },

        $update_remove_section: function (id) {
            const found = this.sections.findIndex(x => x.id == id)
            if (found != -1)
                this.sections.splice(found, 1)
        },

        show_create_section: async function () {
            const handle_request = this.$request_create_section
            const handle_update = this.$update_created_section
            const result = await swal.fire({
                title: '섹션을 추가합니다...ㅎ',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Create',
                showLoaderOnConfirm: true,
                preConfirm: handle_request,
                allowOutsideClick: () => !swal.isLoading()
            })

            if (result.value.body.success) {
                handle_update(result.value.body.section.id, result.value.body.section.name)
                swal.fire({
                    icon: 'success',
                    title: 'Request success',
                    text: `You create section '${result.value.body.section.name}'.`
                })
            } else {
                swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Request failed. Check message : ${result.value.body.error}`
                })
            }
        },

        show_create_todo: function (section_id) {
            const handle_request = this.$request_create_todo
            const handle_update = this.$update_created_todo

            swal.fire({
                title: '할 일을 추가합니다..ㅎ',
                html:
                    '<input id="todo-title" class="swal2-input" placeholder="Title">' +
                    '<input id="todo-desc" class="swal2-input" placeholder="Description">',
                showCancelButton: true,
                confirmButtonText: 'Register',
                showLoaderOnConfirm: true,
                preConfirm: async () => {

                    try {
                        const title = document.getElementById('todo-title').value
                        if (title.length == 0)
                            throw 'section title cannot be empty.'

                        const desc = document.getElementById('todo-desc').value
                        if (desc.length == 0)
                            throw 'section description cannot be empty.'

                        const response = await handle_request(title, desc, section_id)

                        if (response.body.success == false)
                            throw response.body.error

                        const todo = response.body.todo
                        console.log(todo)
                        handle_update(todo.id, todo.title, todo.desc, section_id)
                    } catch (e) {
                        swal.showValidationMessage(`Request failed : ${e}`)
                    }
                },
                allowOutsideClick: () => !swal.isLoading()
            })
        },

        remove_section: async function (id) {
            const handle_request = this.$request_remove_section
            const handle_update = this.$update_remove_section
            let response = null

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
                    response = await handle_request(id)
                },
                allowOutsideClick: () => !swal.isLoading()
            })
            if (result.value == false)
                return

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
        },

        remove_todo: async function (id) {

            const handle_request = this.$request_remove_todo
            const handle_update = this.$update_remove_todo
            let response = null

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
                    response = await handle_request(id)
                },
                allowOutsideClick: () => !swal.isLoading()
            })
            if (result.value == false)
                return

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