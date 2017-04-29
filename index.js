
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';

export default class WarPlugin {


    constructor(options) {
        this.outputFile = options.outputFile || './example.war';
        this.files = options.files || [];
        this.html5 = options.html5 || null;
    }


    apply(compiler) {
        const zipOptions = {
            zlib: { level: 0 },
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


            Object.keys(compilation.assets).forEach((key) => {
                let source = compilation.assets[key].source();
                source = Buffer.isBuffer(source) ? source : new Buffer(source);
                archive.append(source, { name: key });
            });

            this.files.forEach((file) => {
                archive.file(path.resolve(file), { name: path.basename(path.resolve(file)) });
            });

            if (this.html5 !== null) {
                archive.file(path.resolve(__dirname, 'web.xml'), { name: 'WEB-INF/web.xml' });
                archive.file(path.resolve(__dirname, 'urlrewritefilter-4.0.3.jar'), { name: 'WEB-INF/lib/urlrewritefilter-4.0.3.jar' });

                let urlrewriteXml = '<urlrewrite default-match-type="wildcard">';
                this.html5.forEach((p) => {
                    urlrewriteXml += `<rule><from>${p}</from><to>/index.html</to></rule>`;
                });
                urlrewriteXml += '</urlrewrite>';
                archive.append(new Buffer(urlrewriteXml.toString('binary'), 'binary'), { name: 'WEB-INF/urlrewrite.xml' });
            }
            archive.finalize();
        });
    }
}
