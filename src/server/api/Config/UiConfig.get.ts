import { log } from "console";
import { defineEventHandler } from "h3";
import { GetDrizzleConnecionString } from "~~/server/db/UseDrizzle";
import { ThemesService } from "~~/server/services/ThemesService";
import { ThemesConfig, ThemesConfigDefault } from "~~/shared/types/ThemeModel";
import { UiConfigModel } from "~~/shared/types/UiConfigModel";

// GET: /Config/UiConfig
export default defineEventHandler(
	async (event): Promise<ApiResponse<UiConfigModel>> => {
		const errors: string[] = [];
		const logs: string[] = [];
		const config = useRuntimeConfig();

		let themesConfig: ThemesConfig | null = null;
		try {
			themesConfig = await new ThemesService().GetThemes();
		} catch (error: any) {
			errors.push("[Uiconfig] GET error: " + error.message);
		}

		const uiConfig: UiConfigModel = {
			themesConfig: themesConfig ?? ThemesConfigDefault,
		};

		// Temporarily output debugging info
		// logs.push(`config.private: ${JSON.stringify(config.private)}`);
		logs.push(`config.public: ${JSON.stringify(config.public)}`);
		logs.push(
			`isCloudflare: ${config.public.environment.runtime == "cloudflare"}`,
		);

		try {
			logs.push(`PG: ${config.private.postgres.url}`);
			logs.push(`HD: ${config.private.postgres.hyperdrive}`);
			logs.push(
				`Drizzle connection string: ${GetDrizzleConnecionString()}`,
			);
			logs.push(`Ctx: ${JSON.stringify(event.context)}`);
			logs.push(`Env: ${JSON.stringify(process.env)}`);
			logs.push(
				`HYPERDRIVE Cs: ${event.context.env?.HYPERDRIVE?.connectionString}`,
			);
			logs.push(
				`HYPERDRIVE: ${JSON.stringify(event.context.env?.HYPERDRIVE)}`,
			);
		} catch (error: any) {
			errors.push(`Error: ${error.message}`);
		}

		return {
			data: uiConfig,
			success: true,
			logs: [...errors, ...logs],
		};
	},
);
