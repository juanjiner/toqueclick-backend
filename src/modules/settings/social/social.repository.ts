import { getPool } from "../../../config/database.js";
import { toCamelCase } from "../../../utils/camelCase.js";
import { Social } from './social.model.js';

export class SocialRepository {

    async findSocial(): Promise<Social> {

        const result = await getPool().query(
            "SELECT * FROM toque.social_networks"
        );

        return toCamelCase(result.rows[0] || null);
    }

    async create(social: Social): Promise<Social> {
        const result = await getPool().query(
            `
        INSERT INTO toque.social_networks 
        (facebook_url, instagram_url, twitter_url, linkedin_url) 
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
            [social.facebookUrl, social.instagramUrl, social.twitterUrl, social.linkedinUrl]
        );

        return toCamelCase(result.rows[0]);
    }

    async update(id: string, social: Social): Promise<Social | null> {
        const result = await getPool().query(
            `
        UPDATE toque.social_networks
        SET 
            facebook_url=$1,
            instagram_url=$2,
            twitter_url=$3,
            linkedin_url=$4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id=$5
        RETURNING *
        `,
            [social.facebookUrl, social.instagramUrl, social.twitterUrl, social.linkedinUrl, id]
        );

        return toCamelCase(result.rows[0] || null);
    }
}