//! Lotify IPC Protocol crate

pub mod framing;

pub use framing::{decode_frame, encode_frame, Frame, MessageType, MAGIC_BYTES, PROTOCOL_VERSION};
