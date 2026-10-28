# Taskflow

Gerenciador de tarefas estilo kanban, com contas de usuário. Cada pessoa vê apenas as próprias tarefas.

**Stack:** Python · Django · Django REST Framework · JWT · Angular (standalone components, signals)

## O que o projeto cobre
- Cadastro e login com JWT; rotas protegidas no Angular (guard + interceptor)
- API REST com CRUD de tarefas e categorias, filtros (categoria, busca) e endpoint de estatísticas
- Isolamento de dados por usuário (testado)
- Quadro com três colunas (A fazer / Fazendo / Feito), contadores e layout responsivo

## Como rodar
Precisa de Python 3.10+ e Node 18.19+. Use **dois terminais**.

### Terminal 1: back-end (a partir da pasta do projeto)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations tasks
python manage.py migrate
python manage.py runserver
```
API em http://localhost:8000. Para rodar os testes: `python manage.py test`.

### Terminal 2: front-end (a partir da pasta do projeto)
```bash
cd frontend
npm install
npm start
```
App em http://localhost:4200.

## Endpoints
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register/` | cria usuário |
| POST | `/api/auth/login/` | retorna `access` e `refresh` |
| GET/POST | `/api/tasks/` | lista (`?category=`, `?search=`, `?status=`) / cria |
| GET/PATCH/DELETE | `/api/tasks/{id}/` | detalhe / edita / remove |
| GET | `/api/tasks/stats/` | contagem por status |
| GET/POST | `/api/categories/` | lista / cria categorias |

## Deploy
- Back-end: Render ou Railway (defina `SECRET_KEY`, `DEBUG=0`, `ALLOWED_HOSTS`, `CORS_ORIGINS`; troque SQLite por PostgreSQL e use gunicorn)
- Front-end: Vercel ou Netlify (altere `API_URL` em `core/api.service.ts` para a URL do back-end)

## Próximos passos (ideias)
Editar tarefa, arrastar e soltar entre colunas, refresh automático do token, paginação.
