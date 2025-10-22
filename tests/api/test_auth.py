import pytest


pytestmark = pytest.mark.anyio


async def test_register_success_student(client, make_email):
    payload = {
        "full_name": "Иван Иванов",
        "email": make_email("student"),
        "password": "password123",
        "role": "student",
    }
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    assert "user_id" in data
    assert isinstance(data["user_id"], int)
    assert data["full_name"] == payload["full_name"]
    assert data["email"] == payload["email"]
    assert data["role"] == payload["role"]
    assert isinstance(data.get("token"), str) and data["token"]


async def test_register_success_teacher(client, make_email):
    payload = {
        "full_name": "Мария Петрова",
        "email": make_email("teacher"),
        "password": "password123",
        "role": "teacher",
    }
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert isinstance(data.get("token"), str) and data["token"]
    assert data["role"] == "teacher"


async def test_register_duplicate_email_400(client, make_email):
    email = make_email("dup")
    payload = {
        "full_name": "Пользователь Дубликат",
        "email": email,
        "password": "password123",
        "role": "student",
    }
    resp1 = await client.post("/auth/register", json=payload)
    assert resp1.status_code == 201, resp1.text

    resp2 = await client.post("/auth/register", json=payload)
    assert resp2.status_code == 400, resp2.text


async def test_register_validation_error_short_password_400(client, make_email):
    payload = {
        "full_name": "Валидатор Короткий Пароль",
        "email": make_email("shortpw"),
        "password": "12345",
        "role": "student",
    }
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 400, resp.text


async def test_register_validation_error_invalid_role_400(client, make_email):
    payload = {
        "full_name": "Неверная Роль",
        "email": make_email("badrole"),
        "password": "password123",
        "role": "admin",
    }
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 400, resp.text


async def test_login_success(client, make_email):
    email = make_email("loginok")
    register_payload = {
        "full_name": "Логин Успех",
        "email": email,
        "password": "password123",
        "role": "student",
    }
    resp_reg = await client.post("/auth/register", json=register_payload)
    assert resp_reg.status_code == 201, resp_reg.text

    login_payload = {"email": email, "password": "password123"}
    resp = await client.post("/auth/login", json=login_payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["email"] == email
    assert isinstance(data.get("token"), str) and data["token"]


async def test_login_wrong_password_401(client, make_email):
    email = make_email("wrongpw")
    resp_reg = await client.post(
        "/auth/register",
        json={
            "full_name": "Неверный Пароль",
            "email": email,
            "password": "password123",
            "role": "student",
        },
    )
    assert resp_reg.status_code == 201, resp_reg.text

    resp = await client.post("/auth/login", json={"email": email, "password": "wrongpass"})
    assert resp.status_code == 401, resp.text


async def test_login_unknown_email_401(client, make_email):
    resp = await client.post(
        "/auth/login",
        json={"email": make_email("nouser"), "password": "password123"},
    )
    assert resp.status_code == 401, resp.text
