import TelegramBot from "node-telegram-bot-api";

export type AdminBot = {
  sendToAdminChannel: (title: string, message: string) => Promise<Error>;
};

type BotProps = {
  token: string;
  botURL: string;
  adminChannel: string;
};
export default function createBot({
  token,
  botURL,
  adminChannel,
}: BotProps): AdminBot {
  //setup
  const bot = new TelegramBot(token);
  bot.setWebHook(`${botURL}/bot${token}`);

  return {
    sendToAdminChannel: async (title: string, message: string) => {
      try {
        await bot.sendMessage(adminChannel, `*${title}*\n${message}`, {
          parse_mode: "MarkdownV2",
        });
      } catch (error) {
        return error;
      }
      return;
    },
  };
}
