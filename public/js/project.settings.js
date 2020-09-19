new Vue({
    el: '#contents',
    data: {
        showModal: false,
        role: 'members',
        project: {
            name: 'IOPM',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
        },
        members: [
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            },
            {
                name: 'Tyrion Lannister',
                email: 'boyism80@gmail.com'
            }
        ],
        sections: [
            {
                name: 'Tyrion Lannister',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            },
            {
                name: 'Tyrion Lannister',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            },
            {
                name: 'Tyrion Lannister',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            },
            {
                name: 'Tyrion Lannister',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            }
        ],
        dest: 'cshyeon'
    },
    methods: {
        tab: function (value) {
            this.role = value
        },
        remove_member: function (member) {
            this.dest = member.name
            this.showModal = true
        },
        remove_section: function (section) {
            this.dest = section.name
            this.showModal = true
        },
        on_success: function (data) {
            console.log(data.role)
            if (data.role == 'members')
                this.members.pop()
            else if (data.role == 'sections')
                this.sections.pop()
            else
                return

            this.showModal = false
        }
    }
})