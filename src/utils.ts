import * as core from '@actions/core';

export interface Info {
    project: {
        sonarProjectKey: string
    }
    host: string
    token: string
}

export function getInfo(repo: { owner: string; repo: string }): Info {
    return {
        project: {
            sonarProjectKey: core.getInput('sonarProjectKey')
                ? core.getInput('sonarProjectKey')
                : `${repo.owner}_${repo.repo}`,
        },
        host: core.getInput('host'),
        token: core.getInput('sonarToken'),
    }
}

class MSGUriBuilder {
    private MSGRAM_SERVICE_HOST = process.env.MSGRAM_SERVICE_HOST !== undefined ? 
        process.env.MSGRAM_SERVICE_HOST as string :
        'https://measuresoft.herokuapp.com'

    public baseUrl : string;
    private currentUri: string;

    constructor() {
        this.baseUrl = `${this.MSGRAM_SERVICE_HOST}/api/v1/`;
        this.currentUri = '';
    }

    listOrganization(): MSGUriBuilder {
        this.currentUri = this.currentUri.concat('organizations/')
        return this;
    }

    detailOrganization(orgId: number): MSGUriBuilder {
        this.currentUri = this.currentUri.concat(`organizations/${orgId}/`);
        return this;
    }

    listProducts(): MSGUriBuilder {
        this.currentUri = this.currentUri.concat('products/')
        return this;
    }

    detailProduct(prodId: number): MSGUriBuilder {
        this.currentUri = this.currentUri.concat(`products/${prodId}/`);
        return this;
    }

    listRepos(): MSGUriBuilder {
        this.currentUri = this.currentUri.concat('repositories/')
        return this;
    }

    detailRepo(repoId: number): MSGUriBuilder {
        this.currentUri = this.currentUri.concat(`repositories/${repoId}/`);
        return this;
    }

    listReleases(): MSGUriBuilder {
        this.currentUri = this.currentUri.concat('release/')
        return this;
    }

    build() :string {
        return this.baseUrl.concat(this.currentUri);
    }
}

export class MSGBaseUris {

    static getOrgsList(): string  {
        return new MSGUriBuilder()
            .listOrganization()
            .build();
    }

    static getOrgsDetail(orgId: number): string  {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .build();
    }

    static getProductsList(orgId: number): string {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .listProducts()
            .build();
    }

    static getProductDetail(orgId: number, prodId: number): string  {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .detailProduct(prodId)
            .build();
    }

    static getReposList(orgId: number, prodId: number): string {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .detailProduct(prodId)
            .listRepos()
            .build();
    }

    static getRepoDetail(orgId: number, prodId: number, repoId: number): string {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .detailProduct(prodId)
            .detailRepo(repoId)
            .build();
    }

    static getReleasesList(orgId: number, prodId: number): string {
        return new MSGUriBuilder()
            .detailOrganization(orgId)
            .detailProduct(prodId)
            .listReleases()
            .build();
    }
}
