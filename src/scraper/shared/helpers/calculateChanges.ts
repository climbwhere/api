import { find, forEach, keys, map, reduce } from "lodash";

import type { SnapshotData } from "../../../db/models/snapshot";

const calculateChanges = (
  previousData: SnapshotData,
  currentData: SnapshotData,
): SnapshotData => {
  return reduce(
    keys(previousData.sessions),
    (changes, gym) => {
      const previousSessions = previousData.sessions?.[gym]?.data;
      if (previousSessions == null) {
        return changes;
      }
      const currentSessions = currentData.sessions?.[gym]?.data;
      if (currentSessions == null) {
        return changes;
      }
      const sessions = reduce(
        previousSessions,
        (sessions, previousSession) => {
          const currentSession = find(currentSessions, {
            id: previousSession.id,
          });
          if (currentSession == null) {
            return sessions;
          }
          const spaces = currentSession.spaces - previousSession.spaces;
          if (spaces === 0) {
            return sessions;
          }
          return [
            ...sessions,
            {
              ...currentSession,
              spaces,
            },
          ];
        },
        [],
      );
      return {
        ...changes,
        [gym]: {
          data: sessions,
        },
      };
    },
    {},
  );
};

export default calculateChanges;
