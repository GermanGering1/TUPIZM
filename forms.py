from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length

class RegisterForm(FlaskForm):
    email = StringField(validators=[DataRequired(), Email()])
    nickname = StringField(validators=[DataRequired(), Length(3, 50)])
    password = PasswordField(validators=[DataRequired(), Length(6, 128)])
    submit = SubmitField("Зарегистрироваться")

class LoginForm(FlaskForm):
    email = StringField(validators=[DataRequired(), Email()])
    password = PasswordField(validators=[DataRequired()])
    submit = SubmitField("Войти")