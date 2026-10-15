import { get, post } from "./client";

export type InitiateCallResponse = {
  sessionUuid: string;
  roomId: string;
  callerToken: string;
  receiverUuid: string;
  receiverNickname: string;
  timeoutSeconds: number;
};

export type CallStatusResponse = {
  sessionUuid: string;
  roomId: string;
  status:
    | "initiated"
    | "ringing"
    | "accepted"
    | "rejected"
    | "missed"
    | "cancelled"
    | "completed"
    | "failed";
  callerId: number;
  receiverId: number;
  callerNickname: string | null;
  receiverNickname: string | null;
  initiatedAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
  secondsUntilExpiry: number;
};

export type IncomingCallResponse = {
  sessionUuid: string;
  roomId: string;
  callerId: number;
  callerNickname: string;
  callerAvatar: string | null;
  callerLanguage: string | null;
  secondsUntilExpiry: number;
} | null;

export type RoomTokenResponse = {
  sessionUuid: string;
  roomId: string;
  userId: number;
  role: "caller" | "receiver";
  token: string;
  expiresInSec: number;
};

export type EndCallResponse = {
  status: string;
  billedMinutes: number;
  durationSeconds: number;
};

export type CallHistoryRow = {
  id: number;
  uuid: string;
  direction: "outgoing" | "incoming";
  peerId: number;
  peerUuid: string;
  peerNickname: string;
  peerAvatar: string | null;
  peerIsOnline: boolean;
  peerIsFemale: boolean;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  billedMinutes: number;
  amount: string;
  status: "finalized" | "refunded" | "disputed";
  myRating: number | null;
  myRatingId: number | null;
};

export type CallHistoryResponse = {
  calls: CallHistoryRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type CallHistoryDirection =
  | "all"
  | "incoming"
  | "outgoing"
  | "missed"
  | "starred";

export type CallHistoryFilters = {
  direction?: CallHistoryDirection;
  search?: string;
  limit?: number;
  offset?: number;
};

export const callsApi = {
  initiate(receiverUuid: string) {
    return post<InitiateCallResponse>("/calls/initiate", { receiverUuid });
  },

  getStatus(sessionUuid: string) {
    return get<CallStatusResponse>(`/calls/${sessionUuid}`);
  },

  getIncoming() {
    return get<IncomingCallResponse>("/calls/incoming");
  },

  accept(sessionUuid: string) {
    return post<{ status: string }>(`/calls/${sessionUuid}/accept`);
  },

  reject(sessionUuid: string) {
    return post<{ status: string }>(`/calls/${sessionUuid}/reject`);
  },

  getRoomToken(sessionUuid: string) {
    return post<RoomTokenResponse>(`/calls/${sessionUuid}/token`);
  },

  end(sessionUuid: string, reason: string = "user_ended") {
    return post<EndCallResponse>(`/calls/${sessionUuid}/end`, { reason });
  },

  getHistory(filters: CallHistoryFilters = {}) {
    const params = new URLSearchParams();
    if (filters.direction && filters.direction !== "all") {
      params.set("direction", filters.direction);
    }
    if (filters.search) {
      params.set("search", filters.search);
    }
    params.set("limit", String(filters.limit ?? 20));
    params.set("offset", String(filters.offset ?? 0));
    return get<CallHistoryResponse>(`/calls/history?${params.toString()}`);
  },
  randomCall() {
    return post<{
      sessionUuid: string;
      roomId: string;
      callerToken: string;
      timeoutSeconds: number;
      targetCount: number;
    }>("/calls/random", {});
  },
};
