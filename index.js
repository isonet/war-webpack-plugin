import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import download from 'download';

export default class WarPlugin {

    constructor(options) {
        this.outputFile = options.outputFile || './example.war';
        this.files = options.files || [];
        this.html5 = options.html5 || null;
        if (this.html5 !== null) {
            this.html5.jarUrl = this.html5.jarUrl || 'http://central.maven.org/maven2/org/tuckey/urlrewritefilter/4.0.3/urlrewritefilter-4.0.3.jar';
            this.html5.paths = this.html5.paths || [];
            this.html5.description = this.html5.description || 'Deployment of static files.';
            this.html5.displayName = this.html5.displayName || 'StaticFileWar';
        }
    }

    apply(compiler) {
        const zipOptions = {
            zlib: {level: 0},
            store: true
        };

        compiler.plugin('emit', (compilation, callback) => {
            // assets from child compilers will be included in the parent so we should not run in child compilers
            if (compiler.isChild()) {
                callback();
                return;
            }

            const archive = archiver('zip', zipOptions);

            const output = fs.createWriteStream(this.outputFile);
            output.on('close', () => {
                callback();
            });

            archive.on('error', (err) => {
                throw err;
            });

            archive.pipe(output);

            // Append each asset from webpack to the archive
            Object.keys(compilation.assets).forEach((key) => {
                let source = compilation.assets[key].source();
                source = Buffer.isBuffer(source) ? source : new Buffer(source);
                archive.append(source, {name: key});
            });

            // Append additional files to the archive
            this.files.forEach((file) => {
                archive.file(path.resolve(file), {name: path.basename(path.resolve(file))});
            });

            if (this.html5 === null) {
                archive.finalize();
            } else {
                archive.append(this._generateWebXmlBuffer(), {name: 'WEB-INF/web.xml'});
                archive.append(this._generateUrlRewriteXmlBuffer(), {name: 'WEB-INF/urlrewrite.xml'});

                // Download the url rewrite jar and finish the archive when ready
                download(this.html5.jarUrl).then((data) => {
                    archive.append(data, {name: 'WEB-INF/lib/urlrewritefilter.jar'});
                    archive.finalize();
                });
            }
        });
    }

    _generateUrlRewriteXmlBuffer() {
        let urlrewriteXml = '<urlrewrite default-match-type="wildcard">';
        this.html5.paths.forEach((p) => {
            urlrewriteXml += `<rule><from>${p}</from><to>/index.html</to></rule>`;
        });
        urlrewriteXml += '</urlrewrite>';
        return Buffer.from(urlrewriteXml, 'utf8');
    }

    _generateWebXmlBuffer() {
        // Careful, no blank space before <?xml
        const webXml = `<?xml version="1.0" encoding="UTF-8"?>
            <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd" version="4.0" metadata-complete="true">
                <description>${this.html5.description}</description>
                <display-name>${this.html5.displayName}</display-name>
                <filter>
                    <filter-name>UrlRewriteFilter</filter-name>
                    <filter-class>org.tuckey.web.filters.urlrewrite.UrlRewriteFilter</filter-class>
                </filter>
                <filter-mapping>
                    <filter-name>UrlRewriteFilter</filter-name>
                    <url-pattern>/*</url-pattern>
                    <dispatcher>REQUEST</dispatcher>
                    <dispatcher>FORWARD</dispatcher>
                </filter-mapping>
            </web-app>`;
        return Buffer.from(webXml, 'utf8');
    }
}
