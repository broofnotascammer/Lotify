#[cfg(test)]
mod tests {
    use bytes::BytesMut;
    use lotify_protocol::{decode_frame, encode_frame, Frame, MessageType};

    #[test]
    fn test_ipc_frame_encode_decode() {
        let frame = Frame {
            seq: 42,
            msg_type: MessageType::HandshakeReq,
            payload: b"{\"client\":\"lotify-gtk\",\"pid\":1000}".to_vec(),
        };

        let mut buf = BytesMut::new();
        encode_frame(&frame, &mut buf);

        let decoded = decode_frame(&mut buf).expect("Decoding should succeed");
        assert!(decoded.is_some());
        let res = decoded.unwrap();

        assert_eq!(res.seq, 42);
        assert_eq!(res.msg_type, MessageType::HandshakeReq);
        assert_eq!(res.payload, frame.payload);
    }
}
