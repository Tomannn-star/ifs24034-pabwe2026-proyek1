pipeline {
    agent any

    environment {
        PATH = "${env.HOME ? env.HOME + '/.bun/bin:' : ''}${env.PATH}"
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    stages {
        stage('Verifikasi Environment') {
            steps {
                script {
                    echo "============================================="
                    echo "🚀 Pipeline CI/CD Frontend KasPintar"
                    echo "============================================="
                    if (isUnix()) {
                        sh 'bun --version'
                        sh 'git log -1 --oneline'
                    } else {
                        bat 'bun --version'
                        bat 'git log -1 --oneline'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "📦 Menginstal dependensi Frontend..."
                    if (isUnix()) {
                        sh 'bun install --frozen-lockfile || bun install'
                    } else {
                        bat 'bun install'
                    }
                }
            }
        }

        stage('Build Frontend SPA') {
            steps {
                script {
                    echo "🏗️ Membangun build produksi SPA SvelteKit..."
                    if (isUnix()) {
                        sh 'bun run build'
                    } else {
                        bat 'bun run build'
                    }
                }
            }
        }

        stage('Verifikasi Artefak Build') {
            steps {
                script {
                    echo "🔍 Memverifikasi artefak build/index.html..."
                    if (isUnix()) {
                        sh 'test -f build/index.html && echo "✅ Artefak build/index.html ditemukan!"'
                    } else {
                        bat 'if exist build\\index.html (echo Artefak build/index.html ditemukan!) else (exit 1)'
                    }
                }
            }
        }

        stage('Arsip Artefak') {
            steps {
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true, allowEmptyArchive: false
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline Frontend KasPintar selesai dijalankan."
        }
        success {
            echo "🎉 SUKSES: Build Frontend SPA berhasil dibangun!"
        }
        failure {
            echo "❌ GAGAL: Terjadi kesalahan pada build frontend."
        }
    }
}

