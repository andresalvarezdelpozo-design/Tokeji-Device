import unittest

import app as app_module


class AppEndpointsTest(unittest.TestCase):
    def setUp(self):
        self.client = app_module.app.test_client()

        self._guardar_original = app_module.guardar_datos
        app_module.guardar_datos = lambda: None

        self._snapshot = {
            "encuestas": list(app_module.encuestas),
            "votos_encuesta": dict(app_module.votos_encuesta),
            "eventos": list(app_module.eventos),
            "perfiles": dict(app_module.perfiles),
            "friend_links": dict(app_module.friend_links),
            "friend_events": dict(app_module.friend_events),
        }

        app_module.encuestas[:] = [
            {
                "id": "poll_1",
                "pregunta": "Test",
                "opciones": ["A", "B"],
                "expira": 4102444800,
                "activa": True,
            }
        ]
        app_module.votos_encuesta.clear()
        app_module.eventos[:] = []
        app_module.friend_links.clear()
        app_module.friend_events.clear()
        app_module.perfiles.clear()
        app_module.perfiles.update(
            {
                "alice": {"instituto": "IES A", "curso": "3A", "nombre": "Alice", "avatar": "🐱"},
                "bob": {"instituto": "IES B", "curso": "3B", "nombre": "Bob", "avatar": "🐶"},
                "charlie": {"instituto": "IES A", "curso": "3C", "nombre": "Charlie", "avatar": "🦊"},
            }
        )

    def tearDown(self):
        app_module.guardar_datos = self._guardar_original

        app_module.encuestas[:] = self._snapshot["encuestas"]
        app_module.votos_encuesta.clear()
        app_module.votos_encuesta.update(self._snapshot["votos_encuesta"])
        app_module.eventos[:] = self._snapshot["eventos"]
        app_module.perfiles.clear()
        app_module.perfiles.update(self._snapshot["perfiles"])
        app_module.friend_links.clear()
        app_module.friend_links.update(self._snapshot["friend_links"])
        app_module.friend_events.clear()
        app_module.friend_events.update(self._snapshot["friend_events"])

    def test_encuesta_no_permita_doble_voto(self):
        payload = {"userId": "alice", "encuestaId": "poll_1", "opcion": 0}

        first = self.client.post("/encuestas/votar", json=payload)
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.get_json()["ok"])

        second = self.client.post("/encuestas/votar", json=payload)
        self.assertEqual(second.status_code, 409)
        body = second.get_json()
        self.assertFalse(body["ok"])

    def test_home_state_filtra_eventos_por_instituto(self):
        vote = self.client.post(
            "/encuestas/votar",
            json={"userId": "alice", "encuestaId": "poll_1", "opcion": 1},
        )
        self.assertEqual(vote.status_code, 200)

        home_alice = self.client.get("/home-state", query_string={"userId": "alice"})
        self.assertEqual(home_alice.status_code, 200)
        murmullo_alice = home_alice.get_json()["murmullo"]
        self.assertTrue(any("encuesta" in item for item in murmullo_alice))

        home_bob = self.client.get("/home-state", query_string={"userId": "bob"})
        self.assertEqual(home_bob.status_code, 200)
        murmullo_bob = home_bob.get_json()["murmullo"]
        self.assertFalse(any("encuesta" in item for item in murmullo_bob))

    def test_friends_link_notifica_a_ambos_usuarios(self):
        response = self.client.post(
            "/friends/link",
            json={
                "userId": "alice",
                "friendId": "bob",
                "userName": "Alice",
                "friendName": "Bob",
                "userAvatar": "🐱",
                "friendAvatar": "🐶",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json().get("created"))

        ev_alice = self.client.get("/friends/events", query_string={"userId": "alice"})
        ev_bob = self.client.get("/friends/events", query_string={"userId": "bob"})
        self.assertEqual(len(ev_alice.get_json().get("events", [])), 1)
        self.assertEqual(len(ev_bob.get_json().get("events", [])), 1)

    def test_lista_instituto_acepta_instituto_por_parametro(self):
        app_module.perfiles.pop("alice", None)
        response = self.client.get(
            "/lista-instituto",
            query_string={"userId": "alice", "instituto": "IES A"},
        )
        self.assertEqual(response.status_code, 200)
        ids = {r["id"] for r in response.get_json().get("companeros", [])}
        self.assertIn("charlie", ids)


if __name__ == "__main__":
    unittest.main()
