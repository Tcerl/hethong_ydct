from gatco_jinja2 import GatcoJinja2

class Jinja(GatcoJinja2):
    def init_app(self, app, loader=None, pkg_name=None, pkg_path=None):
        super(Jinja, self).init_app(app, loader, pkg_name, pkg_path)
        self.add_env("static_url", app.config.get("STATIC_URL", ""))
        self.add_env("upload_file_url", app.config.get("URL_FILEUPLOAD", ""))
        self.add_env("cdn_url", app.config.get("URL_VIEW_FILE_UPLOAD", ""))
        print("=================static_url", app.config.get("STATIC_URL", ""))
        # print("URL_VIEW_FILE_UPLOAD====",app.config.get("URL_VIEW_FILE_UPLOAD", ""))