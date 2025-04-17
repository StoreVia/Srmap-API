import importlib
import os
from flask import Flask
from waitress import serve
from dotenv import load_dotenv

load_dotenv(override=True)
PORT = int(os.getenv("port"))

def create_app():
    app = Flask(__name__, static_folder='public')
    routes_dir = "routes"
    for filename in os.listdir(routes_dir):
        if filename.endswith(".py") and filename != "__init__.py":
            module_name = f"{routes_dir}.{filename[:-3]}"
            module = importlib.import_module(module_name)
            if hasattr(module, "register_routes"):
                module.register_routes(app)
    return app

if __name__ == '__main__':
    app = create_app()
    print(f"Started Server On Port:- {PORT}")
    serve(app, host="0.0.0.0", port=PORT)