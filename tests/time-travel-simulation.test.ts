import { describe, it, beforeEach, expect } from 'vitest';

// Simulated contract state
let messages: Map<number, { sender: string, content: string, sendTime: number, targetTime: number, isParadox: boolean }>;
let userMessages: Map<string, number[]>;
let contractOwner: string;
let currentTime: number;
let nextMessageId: number;

// Simulated contract functions
function sendMessage(sender: string, content: string, targetTime: number): { success: boolean; result?: number; error?: string } {
  if (content.length === 0) {
    return { success: false, error: "Invalid input" };
  }
  if (isParadox(currentTime, targetTime)) {
    return { success: false, error: "Paradox detected" };
  }
  const messageId = nextMessageId++;
  messages.set(messageId, { sender, content, sendTime: currentTime, targetTime, isParadox: false });
  
  const userMessageList = userMessages.get(sender) || [];
  userMessageList.push(messageId);
  userMessages.set(sender, userMessageList);
  
  return { success: true, result: messageId };
}

function getMessage(messageId: number): { success: boolean; result?: { sender: string, content: string, sendTime: number, targetTime: number, isParadox: boolean, isAvailable: boolean }; error?: string } {
  const message = messages.get(messageId);
  if (!message) {
    return { success: false, error: "Message not found" };
  }
  const isAvailable = currentTime >= message.targetTime;
  return {
    success: true,
    result: { ...message, isAvailable }
  };
}

function getUserMessages(user: string): number[] {
  return userMessages.get(user) || [];
}

function advanceTime(caller: string, timeIncrement: number): { success: boolean; result?: number; error?: string } {
  if (caller !== contractOwner) {
    return { success: false, error: "Not authorized" };
  }
  currentTime += timeIncrement;
  return { success: true, result: currentTime };
}

function isParadox(sendTime: number, targetTime: number): boolean {
  return targetTime < sendTime && (sendTime - targetTime) > 100;
}

describe('Time-Travel Simulation Contract', () => {
  beforeEach(() => {
    messages = new Map();
    userMessages = new Map();
    contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    currentTime = 0;
    nextMessageId = 0;
  });
  
  it('should send a message to the future', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'Hello from the past!';
    const targetTime = 100;
    const result = sendMessage(sender, content, targetTime);
    expect(result.success).toBe(true);
    expect(result.result).toBe(0);
    expect(messages.size).toBe(1);
    expect(userMessages.get(sender)).toContain(0);
  });
  
  it('should not send a message with empty content', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = '';
    const targetTime = 100;
    const result = sendMessage(sender, content, targetTime);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input");
  });
  
  it('should mark future messages as not available', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'Hello from the past!';
    const targetTime = 100;
    const sendResult = sendMessage(sender, content, targetTime);
    const getResult = getMessage(sendResult.result!);
    expect(getResult.success).toBe(true);
    expect(getResult.result!.isAvailable).toBe(false);
  });
  
  it('should mark messages as available after time has passed', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'Hello from the past!';
    const targetTime = 100;
    const sendResult = sendMessage(sender, content, targetTime);
    advanceTime(contractOwner, 100);
    const getResult = getMessage(sendResult.result!);
    expect(getResult.success).toBe(true);
    expect(getResult.result!.isAvailable).toBe(true);
    expect(getResult.result!.content).toBe(content);
  });
  
  it('should detect paradoxes', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const content = 'Paradox incoming!';
    const targetTime = currentTime - 101; // More than 100 units in the past
    const result = sendMessage(sender, content, targetTime);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Paradox detected");
  });
  
  it('should return user messages', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    sendMessage(sender, 'Message 1', 100);
    sendMessage(sender, 'Message 2', 200);
    const userMessageIds = getUserMessages(sender);
    expect(userMessageIds).toHaveLength(2);
    expect(userMessageIds).toContain(0);
    expect(userMessageIds).toContain(1);
  });
  
  it('should only allow contract owner to advance time', () => {
    const nonOwner = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = advanceTime(nonOwner, 100);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authorized");
    expect(currentTime).toBe(0);
  });
});

