from flask import send_from_directory
import random

def register_routes(app):
    @app.route('/')
    def serve_index():
        return send_from_directory('public/pages', 'index.html')

    @app.route('/dashboard')
    def serve_dashboard():
        return send_from_directory('public/pages', 'dashboard.html')

    @app.route('/loading')
    def loading_load():
        gif_name = f"loading{random.randint(1, 5)}.gif"
        return send_from_directory('public/icons/gifs', gif_name)

    @app.route('/favicon')
    def favicon_load():
        return send_from_directory('public/icons', 'favicon.ico')

    @app.route('/js/<path:filename>')
    def serve_js(filename):
        return send_from_directory('public/js', filename)

    @app.route('/css/<path:filename>')
    def serve_css(filename):
        return send_from_directory('public/css', filename)
    
    @app.route('/images/<path:filename>')
    def serve_images(filename):
        return send_from_directory('public/images', filename)
    
    @app.route('/notice')
    def server_notice():
        return send_from_directory('', 'notice.json')
    
    @app.route('/ad')
    def server_ad():
        return send_from_directory('', 'ad.json')
    
    @app.errorhandler(404)
    def page_not_found(e):
        return send_from_directory('public/pages', 'error.html'), 404
