//! Unix Domain Socket Protocol Framing
//! 4 bytes Magic | 2 bytes Version | 4 bytes Seq | 2 bytes MsgType | 4 bytes Length | Payload

use bytes::{Buf, BufMut, BytesMut};
use lotify_errors::{LotifyError, Result};

pub const MAGIC_BYTES: u32 = 0x4C4F5449; // "LOTI"
pub const PROTOCOL_VERSION: u16 = 1;
pub const HEADER_SIZE: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MessageType {
    HandshakeReq = 1,
    HandshakeResp = 2,
    GetStateReq = 3,
    GetStateResp = 4,
    StartRuntimeReq = 5,
    StartRuntimeResp = 6,
    StopRuntimeReq = 7,
    StopRuntimeResp = 8,
    LaunchAppReq = 9,
    LaunchAppResp = 10,
    HeartbeatPing = 11,
    HeartbeatPong = 12,
}

impl MessageType {
    pub fn from_u16(val: u16) -> Option<Self> {
        match val {
            1 => Some(Self::HandshakeReq),
            2 => Some(Self::HandshakeResp),
            3 => Some(Self::GetStateReq),
            4 => Some(Self::GetStateResp),
            5 => Some(Self::StartRuntimeReq),
            6 => Some(Self::StartRuntimeResp),
            7 => Some(Self::StopRuntimeReq),
            8 => Some(Self::StopRuntimeResp),
            9 => Some(Self::LaunchAppReq),
            10 => Some(Self::LaunchAppResp),
            11 => Some(Self::HeartbeatPing),
            12 => Some(Self::HeartbeatPong),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Frame {
    pub seq: u32,
    pub msg_type: MessageType,
    pub payload: Vec<u8>,
}

pub fn encode_frame(frame: &Frame, dst: &mut BytesMut) {
    dst.reserve(HEADER_SIZE + frame.payload.len());
    dst.put_u32(MAGIC_BYTES);
    dst.put_u16(PROTOCOL_VERSION);
    dst.put_u32(frame.seq);
    dst.put_u16(frame.msg_type as u16);
    dst.put_u32(frame.payload.len() as u32);
    dst.put_slice(&frame.payload);
}

pub fn decode_frame(src: &mut BytesMut) -> Result<Option<Frame>> {
    if src.len() < HEADER_SIZE {
        return Ok(None);
    }

    let mut header_bytes = &src[..HEADER_SIZE];
    let magic = header_bytes.get_u32();
    if magic != MAGIC_BYTES {
        return Err(LotifyError::Ipc(format!("Invalid magic bytes: 0x{:08X}", magic)));
    }

    let version = header_bytes.get_u16();
    if version != PROTOCOL_VERSION {
        return Err(LotifyError::Ipc(format!("Unsupported protocol version: {}", version)));
    }

    let seq = header_bytes.get_u32();
    let msg_type_raw = header_bytes.get_u16();
    let msg_type = MessageType::from_u16(msg_type_raw)
        .ok_or_else(|| LotifyError::Ipc(format!("Unknown message type ID: {}", msg_type_raw)))?;

    let payload_len = header_bytes.get_u32() as usize;

    if src.len() < HEADER_SIZE + payload_len {
        return Ok(None);
    }

    src.advance(HEADER_SIZE);
    let payload = src.split_to(payload_len).to_vec();

    Ok(Some(Frame {
        seq,
        msg_type,
        payload,
    }))
}
