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
        show_create_section_dialog: false,
        create_params: {
            title: ''
        },
        sections: [
            {
                name: 'Lorem ipsum',
                todo_list: [
                    {
                        title: 'Lorem ipsum',
                        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        owner: {
                            name: 'Tyrion Lannister',
                            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    },
                    {
                        title: 'Lorem ipsum',
                        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        owner: {
                            name: 'Tyrion Lannister',
                            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    },
                    {
                        title: 'Lorem ipsum',
                        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        owner: {
                            name: 'Tyrion Lannister',
                            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    },
                    {
                        title: 'Lorem ipsum',
                        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                        owner: {
                            name: 'Tyrion Lannister',
                            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    }
                ]
            }
        ]
    },
    mounted: async function () {
        try {
            const response = await this.$http.get
                (
                    `../api/section/find_by_project/${current_project_name()}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

            if (response.data.success == false)
                throw response.data.error

            // this.sections = response.data.sections
            this.sections = this.sections.concat(response.data.sections)
            console.log(this.sections)
        } catch (e) {
            alert(e)
        }
    },
    methods: {
        show_create_section: function () {
            this.create_params.title = 'sample section name'
            this.show_create_section_dialog = true
        },
        create_section: async function (data) {
            try {
                const response = await this.$http.post
                    (
                        '../api/section/make',
                        {
                            name: data.title,
                            project: current_project_name()
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )

                if (response.data.success == false)
                    throw response.data.error

                this.sections.push({ title: response.data.section.name })
            } catch (e) {
                alert(e)
            }

            console.log(data)
            this.show_create_section_dialog = false
        }
    }
})