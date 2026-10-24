pipeline {
    agent any

    environment {
        // Path environment untuk runtime Bun pada Linux / Windows agent
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
                    echo "🚀 Pipeline CI/CD KasPintar: Verifikasi Bun"
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
                    echo "📦 Menginstal dependensi Backend & Frontend..."
                    if (isUnix()) {
                        sh '''
                            cd backend
                            bun install --frozen-lockfile || bun install
                            cd ../frontend
                            bun install --frozen-lockfile || bun install
                        '''
                    } else {
                        bat '''
                            cd backend
                            bun install
                            cd ..\\frontend
                            bun install
                        '''
                    }
                }
            }
        }

        stage('Test Backend API') {
            steps {
                script {
                    echo "🧪 Menjalankan pengujian otomatis backend KasPintar..."
                    if (isUnix()) {
                        sh '''
                            cd backend
                            bun test
                        '''
                    } else {
                        bat '''
                            cd backend
                            bun test
                        '''
                    }
                }
            }
        }

        stage('Build Frontend SPA') {
            steps {
                script {
                    echo "🏗️ Membangun build produksi SPA SvelteKit..."
                    if (isUnix()) {
                        sh '''
                            cd frontend
                            bun run build
                        '''
                    } else {
                        bat '''
                            cd frontend
                            bun run build
                        '''
                    }
                }
            }
        }

        stage('Verifikasi Hasil Build') {
            steps {
                script {
                    echo "🔍 Memverifikasi artefak build statis..."
                    if (isUnix()) {
                        sh 'test -f frontend/build/index.html && echo "✅ Artefak frontend/build/index.html ditemukan!"'
                    } else {
                        bat 'if exist frontend\\build\\index.html (echo Artefak frontend/build/index.html ditemukan!) else (exit 1)'
                    }
                }
            }
        }

        stage('Arsip Artefak') {
            steps {
                archiveArtifacts artifacts: 'frontend/build/**/*', fingerprint: true, allowEmptyArchive: false
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline KasPintar selesai dijalankan."
        }
        success {
            echo "🎉 SUKSES: Semua pengujian backend lolos dan build frontend berhasil dibangun!"
        }
        failure {
            echo "❌ GAGAL: Terjadi kesalahan pada pipeline. Silakan periksa log di atas."
        }
    }
}
