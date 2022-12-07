import path from 'path'
import { command } from './command'
import { PACKAGES_DIR } from './package-json'

//// Process ////

export class FileProcess {

    get name(): string {
        return this._name
    }
    constructor(
        protected readonly _name: string,
        protected _onRun: (file: string) => Promise<void>
    ) {}

    private _running: Promise<void> | null = null
    get isRunning(): boolean {
        return !!this._running
    }
    
    run(file: string): Promise<void> {
        if (this.isRunning)
            throw new Error(`${this.name} is already running`)

        this._running = this
            ._onRun(file)
            .then(this._onComplete)
            .catch(this._onComplete)

        return this._running
    }

    //// Processes ////

    protected readonly _onComplete = (error: Error | void): void => {
        if (!this.isRunning)
            throw new Error(`${this.name} is is not running`)

        if (error instanceof Error)
            console.error('\n' + this.name,'error', error)

        this._running = null
    }
}

export class PackageProcess extends FileProcess {

    protected _pkgDir = ''
    get dir(): string {
        return this._pkgDir
    }

    override get name(): string {
        return this.pkg + ' ' + this._name
    }

    get pkg(): string {
        return '@benzed/' + path.basename(this._pkgDir)
    }

    constructor(
        name: string,
        onRun: (pkgDir: string) => Promise<void>
    ) {
        super(name, onRun)
    }

    override run(file: string): Promise<void> {

        const filePkgDirIndex = file.indexOf(PACKAGES_DIR)
        if (filePkgDirIndex < 0)
            throw new Error(this.constructor.name + ' must be called in package files')

        const pkgDir = file.slice(
            filePkgDirIndex,
            file.indexOf(path.sep, filePkgDirIndex + PACKAGES_DIR.length + 1)
            //                                                   ^ ignore first slash
        )
        
        return super.run(this._pkgDir = pkgDir)
    }
}

export class PackageSpawnProcess extends PackageProcess {

    constructor(
        name: string,
        cmd: string,
        ...args: readonly string []
    ) {
        super(
            name,
            async (pkgDir: string) => {
                console.clear()
                await command(cmd, args, { cwd: pkgDir, stdio: 'inherit' })
            }
        )
    }
}
