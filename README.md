# Tokeji-Device
Tokeji Device - Tamagotchi social messenger

## Cómo trabajar siempre con el código más reciente de GitHub

Si este entorno está "atascado" en una versión antigua, normalmente falta la conexión con el remoto.

1. Comprueba si existe remoto:
   ```bash
   git remote -v
   ```
2. Si no aparece `origin`, añádelo con la URL real de tu repo:
   ```bash
   git remote add origin <URL_DE_TU_REPO_GITHUB>
   ```
3. Descarga los cambios recientes:
   ```bash
   git fetch origin
   ```
4. Crea una rama nueva basada en la rama principal actual (`main` o `master`):
   ```bash
   git checkout -b feature/nueva-mejora origin/main
   ```
5. Haz tus cambios, confirma y sube la rama:
   ```bash
   git add .
   git commit -m "feat: descripción breve"
   git push -u origin feature/nueva-mejora
   ```
6. Abre un Pull Request desde esa rama en GitHub.

> Consejo: evita trabajar directamente sobre una rama local sin remoto, porque no podrá sincronizarse con los cambios actuales del repositorio.
