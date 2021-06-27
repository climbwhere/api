import TelegramBot from "node-telegram-bot-api";

export type AdminBot = {
  sendToAdminChannel: (title: string, message: string) => Promise<Error>;
};

export function create({
  token,
  botURL,
  adminChannel,
}: {
  token: string;
  botURL: string;
  adminChannel: string;
}): AdminBot {
  const bot = new TelegramBot(token);
  bot.setWebHook(`${botURL}/bot${token}`);

  return {
    sendToAdminChannel: async (title: string, message: string) => {
      try {
        await bot.sendMessage(
          adminChannel,
          `*${escapeString(title)}*\n${escapeString(message)}`,
          {
            parse_mode: "MarkdownV2",
          },
        );
      } catch (error) {
        console.error(error);
        return error;
      }
      return;
    },
  };
}

export const escapeString = (string: string): string =>
  string.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi, (x, y) =>
    y ? y : "\\" + x,
  );

export default {
  create,
  escapeString,
};
