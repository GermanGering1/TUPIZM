from flask import Flask, request, jsonify
from flask_login import (LoginManager, login_user, logout_user,
                         login_required, current_user)
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User, Post
from flask_wtf.csrf import CSRFProtect, generate_csrf

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# CSRF Protect должен быть ПОСЛЕ создания app!
csrf = CSRFProtect(app)

login_manager = LoginManager(app)
login_manager.login_view = "login" # Оставляем для редиректов, если нужно

@login_manager.user_loader
def load_user(uid):
    return db.session.get(User, int(uid))

# --- CSRF и ME ---

@app.route("/api/csrf")
def api_csrf():
    return jsonify({"csrf_token": generate_csrf()})

@app.route("/api/me")
def api_me():
    if not current_user.is_authenticated:
        return jsonify({"user": None})
    return jsonify({"user": {
        "id": current_user.id,
        "nickname": current_user.nickname,
        "bio": current_user.bio,
    }})

# --- АУТЕНТИФИКАЦИЯ (JSON) ---

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    nickname = data.get("nickname", "").strip()
    password = data.get("password", "")

    if User.query.filter((User.email == email) | (User.nickname == nickname)).first():
        return jsonify({"error": "Email или никнейм уже заняты"}), 400

    user = User(email=email, nickname=nickname, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    return jsonify({"user": {"id": user.id, "nickname": user.nickname, "bio": user.bio}})

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email", "").lower().strip()).first()
    if user and check_password_hash(user.password_hash, data.get("password", "")):
        login_user(user, remember=True)
        return jsonify({"user": {"id": user.id, "nickname": user.nickname, "bio": user.bio}})
    return jsonify({"error": "Неверный email или пароль"}), 401

@app.route("/api/logout")
@login_required
def api_logout():
    logout_user()
    return jsonify({"ok": True})

# --- ПОСТЫ И ПРОФИЛИ (JSON) ---

@app.route("/api/posts")
def api_posts():
    offset = int(request.args.get("offset", 0))
    posts = Post.query.order_by(Post.created_at.desc()).offset(offset).limit(20).all()
    return jsonify([{
        "id": p.id,
        "content": p.content,
        "author": p.author.nickname,
        "created_at": p.created_at.isoformat(),
    } for p in posts])

@app.route("/api/profile/<nickname>")
def api_profile(nickname):
    user = User.query.filter_by(nickname=nickname).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    return jsonify({
        "user": {"id": user.id, "nickname": user.nickname, "bio": user.bio},
        "posts": [{
            "id": p.id,
            "content": p.content,
            "created_at": p.created_at.isoformat()
        } for p in posts]
    })

@app.route("/api/profile/edit", methods=["POST"])
@login_required
def api_edit_profile():
    data = request.get_json()
    bio = data.get("bio", "").strip()
    if len(bio) > 500:
        return jsonify({"error": "Слишком длинное био"}), 400
        
    current_user.bio = bio
    db.session.commit()
    return jsonify({"user": {"id": current_user.id, "nickname": current_user.nickname, "bio": current_user.bio}})

@app.route("/api/post/create", methods=["POST"])
@login_required
def api_create_post():
    data = request.get_json()
    content = data.get("content", "").strip()
    if not content or len(content) > 2000:
        return jsonify({"error": "Некорректный контент"}), 400
        
    post = Post(content=content, user_id=current_user.id)
    db.session.add(post)
    db.session.commit()
    return jsonify({"ok": True})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)