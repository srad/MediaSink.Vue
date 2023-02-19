node {
    def app

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    stage('write') {
           script {
               def data = """VUE_APP_APIURL=
VUE_APP_BASE=
VUE_APP_NAME=
VUE_APP_SOCKETURL=
"""
               writeFile(file: '.env', text: data)
           }
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */

        app = docker.build("sedrad/streamsinkvue")
    }

    stage('Push image') {
        /* Finally, we'll push the image with two tags:
         * First, the incremental build number from Jenkins
         * Second, the 'latest' tag.
         * Pushing multiple tags is cheap, as all the layers are reused. */
        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            //app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }
}
