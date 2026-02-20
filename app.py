from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import json
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

ARCHIVO_DATOS = "tokeji_datos.json"


def hoy_str():
    return datetime.utcnow().strftime("%Y-%m-%d")


def ayer_str():
    return (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")


def clave_contexto(provincia, instituto, curso):
    return f"{provincia}|{instituto}|{curso}"


def cargar_datos():
    try:
        with open(ARCHIVO_DATOS, "r") as f:
            return json.load(f)
    except Exception:
        return {
            "toques_por_usuario": {},
            "toques_recibidos": {},
            "respuestas_recibidas": {},
            "desafios_pendientes": {},
            "combates_finalizados": [],
            "usuarios_perfil": {},
            "murmullo_stats": {},
            "rachas": {}
        }


def guardar_datos():
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump({
            "toques_por_usuario": toques_por_usuario,
            "toques_recibidos": toques_recibidos,
            "respuestas_recibidas": respuestas_recibidas,
            "desafios_pendientes": desafios_pendientes,
            "combates_finalizados": combates_finalizados,
            "usuarios_perfil": usuarios_perfil,
            "murmullo_stats": murmullo_stats,
            "rachas": rachas
        }, f)


def registrar_usuario(user_id, nombre=None, avatar=None, provincia=None, instituto=None, curso=None):
    if not user_id:
        return
    perfil = usuarios_perfil.get(user_id, {})
    if nombre:
        perfil["nombre"] = nombre
    if avatar:
        perfil["avatar"] = avatar
    if provincia:
        perfil["provincia"] = provincia
    if instituto:
        perfil["instituto"] = instituto
    if curso:
        perfil["curso"] = curso
    usuarios_perfil[user_id] = perfil


def actualizar_murmullo(provincia, instituto, curso, tipo, emisor_nombre=None):
    if not all([provincia, instituto, curso]):
        return
    k = clave_contexto(provincia, instituto, curso)
    stats = murmullo_stats.get(k, {
        "tokes_hoy": 0,
        "anonimos_hoy": 0,
        "crushes_activos": 0,
        "rachas_activas": 0,
        "tipos": {},
        "usuarios": {},
        "horas": {}
    })

    stats["tokes_hoy"] += 1
    if tipo == "anonimo":
        stats["anonimos_hoy"] += 1
    if tipo == "crush":
        stats["crushes_activos"] += 1

    stats["tipos"][tipo] = stats["tipos"].get(tipo, 0) + 1
    if emisor_nombre:
        stats["usuarios"][emisor_nombre] = stats["usuarios"].get(emisor_nombre, 0) + 1

    hora = datetime.utcnow().strftime("%H:%M")[:2] + ":00"
    stats["horas"][hora] = stats["horas"].get(hora, 0) + 1

    murmullo_stats[k] = stats


def actualizar_racha(a, b, provincia=None, instituto=None, curso=None):
    if not a or not b:
        return
    pareja = "|".join(sorted([a, b]))
    r = rachas.get(pareja)
    hoy = hoy_str()
    ayer = ayer_str()

    if r and r.get("ultimo_dia") == hoy:
        pass
    elif r and r.get("ultimo_dia") == ayer:
        r["contador"] = r.get("contador", 1) + 1
        r["ultimo_dia"] = hoy
        r["rota"] = False
    elif r:
        r["contador"] = 1
        r["ultimo_dia"] = hoy
        r["rota"] = True
    else:
        r = {"contador": 1, "ultimo_dia": hoy, "rota": False}

    rachas[pareja] = r

    if provincia and instituto and curso:
        k = clave_contexto(provincia, instituto, curso)
        stats = murmullo_stats.get(k, {
            "tokes_hoy": 0,
            "anonimos_hoy": 0,
            "crushes_activos": 0,
            "rachas_activas": 0,
            "tipos": {},
            "usuarios": {},
            "horas": {}
        })
        stats["rachas_activas"] = sum(1 for rr in rachas.values() if rr.get("contador", 0) >= 2 and not rr.get("rota"))
        murmullo_stats[k] = stats


def estado_racha(user_id, friend_id):
    pareja = "|".join(sorted([user_id, friend_id]))
    r = rachas.get(pareja)
    if not r:
        return {"estado": "nueva", "contador": 0}
    if r.get("rota"):
        return {"estado": "rota", "contador": r.get("contador", 1)}
    c = r.get("contador", 1)
    return {"estado": "activa", "contador": c}


datos = cargar_datos()
toques_por_usuario = datos.get("toques_por_usuario", {})
toques_recibidos = datos.get("toques_recibidos", {})
respuestas_recibidas = datos.get("respuestas_recibidas", {})
desafios_pendientes = datos.get("desafios_pendientes", {})
combates_finalizados = datos.get("combates_finalizados", [])
usuarios_perfil = datos.get("usuarios_perfil", {})
murmullo_stats = datos.get("murmullo_stats", {})
rachas = datos.get("rachas", {})


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


@app.route("/toque", methods=["POST"])
def toque():
    try:
        data = request.get_json() or {}
        de = data.get("de") or data.get("emisor")
        para = data.get("para") or data.get("receptor")
        num = data.get("num")
        contexto = data.get("contexto")
        tipo = data.get("tipo") or "toque"
        avatar_remitente = data.get("avatarRemitente", "👤")
        nombre_remitente = data.get("nombreRemitente", "Alguien")
        provincia = data.get("provincia")
        instituto = data.get("instituto")
        curso = data.get("curso")

        if not all([de, para, num]):
            return jsonify(ok=False, error="Faltan datos requeridos"), 400

        clave_usuario = f"rl:{de}"
        contador = toques_por_usuario.get(clave_usuario, 0)
        if contador >= 30:
            return jsonify(ok=False, error="Límite de 30 tokes alcanzado", toques_restantes=0)

        toques_por_usuario[clave_usuario] = contador + 1
        registrar_usuario(de, nombre_remitente, avatar_remitente, provincia, instituto, curso)

        if para not in toques_recibidos:
            toques_recibidos[para] = []

        toques_recibidos[para].append({
            "de": de,
            "num": num,
            "contexto": contexto,
            "tipo": tipo,
            "avatarRemitente": avatar_remitente,
            "nombreRemitente": nombre_remitente,
            "provincia": provincia,
            "instituto": instituto,
            "curso": curso,
            "hora": int(time.time())
        })

        actualizar_racha(de, para, provincia, instituto, curso)
        actualizar_murmullo(provincia, instituto, curso, tipo, nombre_remitente)

        guardar_datos()
        toques_restantes = 30 - (contador + 1)
        return jsonify(ok=True, mensaje="Toke enviado", toques_restantes=toques_restantes)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/anonimo", methods=["POST"])
def enviar_anonimo():
    return enviar_especial("anonimo")


@app.route("/crush", methods=["POST"])
def enviar_crush():
    return enviar_especial("crush")


def enviar_especial(tipo):
    try:
        data = request.get_json() or {}
        de = data.get("de") or data.get("emisor")
        para = data.get("para") or data.get("receptor")
        para_instituto = bool(data.get("para_instituto", False))
        avatar_remitente = data.get("avatarRemitente", "👤")
        nombre_remitente = data.get("nombreRemitente", "Alguien")
        provincia = data.get("provincia")
        instituto = data.get("instituto")
        curso = data.get("curso")

        registrar_usuario(de, nombre_remitente, avatar_remitente, provincia, instituto, curso)

        destinatarios = []
        if para_instituto:
            for uid, perfil in usuarios_perfil.items():
                if uid != de and perfil.get("provincia") == provincia and perfil.get("instituto") == instituto and perfil.get("curso") == curso:
                    destinatarios.append(uid)
        elif para:
            destinatarios = [para]

        if not destinatarios:
            return jsonify(ok=True, mensaje=f"{tipo} enviado", enviados=0)

        for dst in destinatarios:
            if dst not in toques_recibidos:
                toques_recibidos[dst] = []
            toques_recibidos[dst].append({
                "de": None if tipo == "anonimo" else de,
                "num": 7 if tipo == "crush" else 6,
                "contexto": 1,
                "tipo": tipo,
                "avatarRemitente": avatar_remitente,
                "nombreRemitente": "Anónimo" if tipo == "anonimo" else nombre_remitente,
                "provincia": provincia,
                "instituto": instituto,
                "curso": curso,
                "hora": int(time.time())
            })
            if de and tipo == "crush":
                actualizar_racha(de, dst, provincia, instituto, curso)

        actualizar_murmullo(provincia, instituto, curso, tipo, nombre_remitente)
        guardar_datos()
        return jsonify(ok=True, mensaje=f"{tipo} enviado", enviados=len(destinatarios))
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/usuarios-instituto", methods=["GET"])
def usuarios_instituto():
    provincia = request.args.get("provincia")
    instituto = request.args.get("instituto")
    curso = request.args.get("curso")
    exclude_me = request.args.get("exclude_me")

    usuarios = []
    for uid, perfil in usuarios_perfil.items():
        if exclude_me and uid == exclude_me:
            continue
        if provincia and perfil.get("provincia") != provincia:
            continue
        if instituto and perfil.get("instituto") != instituto:
            continue
        if curso and perfil.get("curso") != curso:
            continue
        usuarios.append({
            "id": uid,
            "nombre": perfil.get("nombre", "Alumno"),
            "avatar": perfil.get("avatar", "👤"),
            "curso": perfil.get("curso", curso or "")
        })

    return jsonify(usuarios)


@app.route("/murmullo", methods=["GET"])
def murmullo():
    provincia = request.args.get("provincia")
    instituto = request.args.get("instituto")
    curso = request.args.get("curso")
    k = clave_contexto(provincia, instituto, curso)
    stats = murmullo_stats.get(k, {
        "tokes_hoy": 0,
        "anonimos_hoy": 0,
        "crushes_activos": 0,
        "rachas_activas": 0,
        "tipos": {},
        "usuarios": {},
        "horas": {}
    })

    tipo_top = "Crush"
    tipo_count = 0
    if stats["tipos"]:
        tipo_top, tipo_count = max(stats["tipos"].items(), key=lambda x: x[1])

    usuario_top = "—"
    if stats["usuarios"]:
        usuario_top = max(stats["usuarios"].items(), key=lambda x: x[1])[0]

    hora_pico = "--:--"
    if stats["horas"]:
        hora_pico = max(stats["horas"].items(), key=lambda x: x[1])[0]

    return jsonify({
        "tokes_hoy": stats["tokes_hoy"],
        "anonimos_hoy": stats["anonimos_hoy"],
        "crushes_activos": stats["crushes_activos"],
        "rachas_activas": stats["rachas_activas"],
        "toke_mas_usado": {"tipo": tipo_top, "count": tipo_count},
        "usuario_top": usuario_top,
        "hora_pico": hora_pico
    })


@app.route("/rachas", methods=["GET"])
def obtener_rachas():
    user_id = request.args.get("userId", "")
    ids = request.args.get("ids", "")
    if not user_id:
        return jsonify(ok=False, error="Falta userId"), 400
    friends = [x for x in ids.split(",") if x]
    out = {fid: estado_racha(user_id, fid) for fid in friends}
    return jsonify(ok=True, rachas=out)


@app.route("/toques-pendientes", methods=["GET"])
def toques_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        ahora = int(time.time())
        if user_id in toques_recibidos:
            toques_recibidos[user_id] = [
                t for t in toques_recibidos[user_id]
                if ahora - t["hora"] < 3600
            ]

        toques = toques_recibidos.get(user_id, [])
        toques_recibidos[user_id] = []
        guardar_datos()

        return jsonify(ok=True, toques=toques)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/respuesta", methods=["POST"])
def enviar_respuesta():
    try:
        data = request.get_json()
        de = data.get("de")
        para = data.get("para")
        respuesta = data.get("respuesta")
        texto = data.get("texto")
        avatar_remitente = data.get("avatarRemitente", "👤")
        nombre_remitente = data.get("nombreRemitente", "Alguien")

        if not all([de, para, respuesta]):
            return jsonify(ok=False, error="Faltan datos requeridos (de, para, respuesta)"), 400

        if para not in respuestas_recibidas:
            respuestas_recibidas[para] = []

        respuestas_recibidas[para].append({
            "de": de,
            "respuesta": respuesta,
            "texto": texto or "OK",
            "avatarRemitente": avatar_remitente,
            "nombreRemitente": nombre_remitente,
            "hora": int(time.time())
        })

        guardar_datos()
        return jsonify(ok=True, mensaje="Respuesta enviada")
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/respuestas-pendientes", methods=["GET"])
def respuestas_pendientes():
    try:
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        ahora = int(time.time())
        if user_id in respuestas_recibidas:
            respuestas_recibidas[user_id] = [
                r for r in respuestas_recibidas[user_id]
                if ahora - r["hora"] < 3600
            ]

        respuestas = respuestas_recibidas.get(user_id, [])
        respuestas_recibidas[user_id] = []
        guardar_datos()

        return jsonify(ok=True, respuestas=respuestas)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/desafio", methods=["POST"])
def crear_desafio():
    try:
        data = request.get_json()
        de = data.get("de", "").strip()
        para = data.get("para", "").strip()
        mi_emoji_id = data.get("miEmojiId")

        if not all([de, para, mi_emoji_id]):
            return jsonify(ok=False, error="Faltan datos"), 400

        desafio_id = f"{de}_{para}_{int(time.time())}"
        desafio = {
            "id": desafio_id,
            "de": de,
            "para": para,
            "miEmojiId": mi_emoji_id,
            "creado": int(time.time())
        }

        if para not in desafios_pendientes:
            desafios_pendientes[para] = []
        desafios_pendientes[para].append(desafio)

        guardar_datos()
        return jsonify(ok=True, desafio_id=desafio_id)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/desafios-pendientes", methods=["GET"])
def obtener_desafios_pendientes():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        ahora = int(time.time())
        for usuario in list(desafios_pendientes.keys()):
            desafios_pendientes[usuario] = [
                d for d in desafios_pendientes[usuario]
                if ahora - d["creado"] < 86400
            ]
            if not desafios_pendientes[usuario]:
                del desafios_pendientes[usuario]

        desafios = desafios_pendientes.get(user_id, [])
        return jsonify(ok=True, desafios=desafios)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/desafio/responder", methods=["POST"])
def responder_desafio():
    try:
        data = request.get_json()
        desafio_id = data.get("desafioId", "").strip()
        aceptado = bool(data.get("aceptado", False))
        mi_emoji_id = data.get("miEmojiId")

        if not desafio_id:
            return jsonify(ok=False, error="Falta desafioId"), 400

        desafio = None
        for usuario, lista in desafios_pendientes.items():
            for d in lista:
                if d["id"] == desafio_id:
                    desafio = d
                    break
            if desafio:
                break

        if not desafio:
            return jsonify(ok=False, error="Desafío no encontrado"), 404

        for usuario in desafios_pendientes:
            desafios_pendientes[usuario] = [
                d for d in desafios_pendientes[usuario]
                if d["id"] != desafio_id
            ]

        if not aceptado:
            guardar_datos()
            return jsonify(ok=True, mensaje="Desafío rechazado")

        poder_atacante = random.random() * 100
        poder_defensor = random.random() * 100
        ganador = desafio["de"] if poder_atacante > poder_defensor else desafio["para"]

        resultado = {
            "id": desafio_id,
            "de": desafio["de"],
            "para": desafio["para"],
            "ganador": ganador,
            "miEmoji": desafio["miEmojiId"],
            "suEmoji": mi_emoji_id,
            "miPoder": poder_atacante,
            "suPoder": poder_defensor,
            "timestamp": int(time.time())
        }

        combates_finalizados.append(resultado)
        ahora = int(time.time())
        combates_finalizados[:] = [c for c in combates_finalizados if ahora - c["timestamp"] < 86400]

        guardar_datos()
        return jsonify(ok=True, resultado=resultado)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/combates-finalizados", methods=["GET"])
def obtener_combates_finalizados():
    try:
        user_id = request.args.get("userId", "").strip()
        if not user_id:
            return jsonify(ok=False, error="Falta userId"), 400

        combates_usuario = []
        for c in combates_finalizados:
            if c.get("de") == user_id or c.get("para") == user_id:
                clave_visto = f"visto_{user_id}"
                if not c.get(clave_visto, False):
                    combates_usuario.append(c)
                    c[clave_visto] = True

        guardar_datos()
        return jsonify(ok=True, combates=combates_usuario)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(ok=True, status="running", version="1.2.0")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Tokeji iniciando en puerto {port}")
    app.run(host="0.0.0.0", port=port)