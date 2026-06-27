import z from 'zod';
import { Message } from '../../utils/constants/messages';

export const objectIdSchema = z.string({ required_error: Message.FAIL_WRONG_SESSIONID_OR_USERID }).min(1, Message.FAIL_WRONG_SESSIONID_OR_USERID);
