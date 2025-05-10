/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const Protocols = $root.Protocols = (() => {

    /**
     * Namespace Protocols.
     * @exports Protocols
     * @namespace
     */
    const Protocols = {};

    Protocols.Protobuf = (function() {

        /**
         * Namespace Protobuf.
         * @memberof Protocols
         * @namespace
         */
        const Protobuf = {};

        Protobuf.PBClass = (function() {

            /**
             * Namespace PBClass.
             * @memberof Protocols.Protobuf
             * @namespace
             */
            const PBClass = {};

            PBClass.MyGuild = (function() {

                /**
                 * Namespace MyGuild.
                 * @memberof Protocols.Protobuf.PBClass
                 * @namespace
                 */
                const MyGuild = {};

                MyGuild.MyGuilds = (function() {

                    /**
                     * Properties of a MyGuilds.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IMyGuilds
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IGuild>|null} [guilds] MyGuilds guilds
                     */

                    /**
                     * Constructs a new MyGuilds.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a MyGuilds.
                     * @implements IMyGuilds
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IMyGuilds=} [properties] Properties to set
                     */
                    function MyGuilds(properties) {
                        this.guilds = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * MyGuilds guilds.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IGuild>} guilds
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @instance
                     */
                    MyGuilds.prototype.guilds = $util.emptyArray;

                    /**
                     * Creates a new MyGuilds instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IMyGuilds=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.MyGuilds} MyGuilds instance
                     */
                    MyGuilds.create = function create(properties) {
                        return new MyGuilds(properties);
                    };

                    /**
                     * Encodes the specified MyGuilds message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.MyGuilds.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IMyGuilds} message MyGuilds message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    MyGuilds.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.guilds != null && message.guilds.length)
                            for (let i = 0; i < message.guilds.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.Guild.encode(message.guilds[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified MyGuilds message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.MyGuilds.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IMyGuilds} message MyGuilds message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    MyGuilds.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a MyGuilds message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.MyGuilds} MyGuilds
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    MyGuilds.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.MyGuilds();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.guilds && message.guilds.length))
                                        message.guilds = [];
                                    message.guilds.push($root.Protocols.Protobuf.PBClass.MyGuild.Guild.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a MyGuilds message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.MyGuilds} MyGuilds
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    MyGuilds.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a MyGuilds message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    MyGuilds.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.guilds != null && message.hasOwnProperty("guilds")) {
                            if (!Array.isArray(message.guilds))
                                return "guilds: array expected";
                            for (let i = 0; i < message.guilds.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.Guild.verify(message.guilds[i]);
                                if (error)
                                    return "guilds." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a MyGuilds message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.MyGuilds} MyGuilds
                     */
                    MyGuilds.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.MyGuilds)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.MyGuilds();
                        if (object.guilds) {
                            if (!Array.isArray(object.guilds))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.MyGuilds.guilds: array expected");
                            message.guilds = [];
                            for (let i = 0; i < object.guilds.length; ++i) {
                                if (typeof object.guilds[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.MyGuilds.guilds: object expected");
                                message.guilds[i] = $root.Protocols.Protobuf.PBClass.MyGuild.Guild.fromObject(object.guilds[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a MyGuilds message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.MyGuilds} message MyGuilds
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    MyGuilds.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.guilds = [];
                        if (message.guilds && message.guilds.length) {
                            object.guilds = [];
                            for (let j = 0; j < message.guilds.length; ++j)
                                object.guilds[j] = $root.Protocols.Protobuf.PBClass.MyGuild.Guild.toObject(message.guilds[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this MyGuilds to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    MyGuilds.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for MyGuilds
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.MyGuilds
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    MyGuilds.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.MyGuilds";
                    };

                    return MyGuilds;
                })();

                MyGuild.Guild = (function() {

                    /**
                     * Properties of a Guild.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IGuild
                     * @property {number|null} [guild_id] Guild guild_id
                     * @property {string|null} [name] Guild name
                     * @property {string|null} [icon] Guild icon
                     * @property {string|null} [description] Guild description
                     * @property {number|null} [owner_id] Guild owner_id
                     * @property {number|null} [permissions] Guild permissions
                     * @property {Array.<number>|null} [channel_lists] Guild channel_lists
                     * @property {number|null} [system_channel_id] Guild system_channel_id
                     * @property {number|null} [system_channel_flags] Guild system_channel_flags
                     * @property {number|null} [system_channel_type] Guild system_channel_type
                     * @property {string|null} [system_channel_message] Guild system_channel_message
                     * @property {string|null} [system_channel_message_pic] Guild system_channel_message_pic
                     * @property {number|null} [authenticate] Guild authenticate
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams|null} [authenticate_params] Guild authenticate_params
                     * @property {string|null} [banner] Guild banner
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IEmoji>|null} [emojis] Guild emojis
                     * @property {number|null} [banned_level] Guild banned_level
                     * @property {string|null} [verification_parameters] Guild verification_parameters
                     * @property {number|null} [verification_level] Guild verification_level
                     * @property {number|null} [verification_auto_remove] Guild verification_auto_remove
                     * @property {Array.<number>|null} [bot_receive] Guild bot_receive
                     * @property {Array.<string>|null} [feature_list] Guild feature_list
                     * @property {number|null} [guild_push_threshold] Guild guild_push_threshold
                     * @property {number|null} [admin_permission] Guild admin_permission
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting|null} [guild_member_dm_friend_setting] Guild guild_member_dm_friend_setting
                     * @property {number|null} [normal_role_id] Guild normal_role_id
                     * @property {number|null} [normal_permission] Guild normal_permission
                     * @property {number|null} [activity_calendar] Guild activity_calendar
                     * @property {number|null} [colling_time] Guild colling_time
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig|null} [banner_config] Guild banner_config
                     * @property {boolean|null} [assist_display] Guild assist_display
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic|null} [icon_dynamic] Guild icon_dynamic
                     * @property {number|null} [template_id] Guild template_id
                     * @property {number|null} [guild_topic_display] Guild guild_topic_display
                     * @property {Array.<number>|null} [topic_list] Guild topic_list
                     * @property {number|null} [joined_at] Guild joined_at
                     * @property {number|null} [is_private] Guild is_private
                     * @property {number|null} [guild_circle_visible] Guild guild_circle_visible
                     * @property {number|null} [guild_circle_view] Guild guild_circle_view
                     * @property {number|null} [guild_circle_comment] Guild guild_circle_comment
                     * @property {number|null} [guild_set_banner] Guild guild_set_banner
                     * @property {number|null} [post_reward] Guild post_reward
                     * @property {number|null} [upload_files] Guild upload_files
                     * @property {number|null} [post_multi_para] Guild post_multi_para
                     * @property {number|null} [related_application] Guild related_application
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication>|null} [related_application_list] Guild related_application_list
                     * @property {number|null} [guild_search_config] Guild guild_search_config
                     * @property {number|null} [guild_search_allow] Guild guild_search_allow
                     * @property {Array.<number>|null} [user_roles] Guild user_roles
                     * @property {number|null} [notification_channel_id] Guild notification_channel_id
                     * @property {number|null} [calendar_channel_id] Guild calendar_channel_id
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IGuildTag>|null} [tags] Guild tags
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle|null} [circle] Guild circle
                     * @property {string|null} [gnick] Guild gnick
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IChannel>|null} [channels] Guild channels
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IRole>|null} [roles] Guild roles
                     * @property {boolean|null} [user_pending] Guild user_pending
                     * @property {number|null} [no_say] Guild no_say
                     * @property {boolean|null} [circle_display] Guild circle_display
                     * @property {string|null} [vanity_url_code] Guild vanity_url_code
                     * @property {number|null} [verification_remove_time] Guild verification_remove_time
                     * @property {number|null} [hierarchy] Guild hierarchy
                     * @property {number|null} [point] Guild point
                     * @property {number|null} [is_new_permission] Guild is_new_permission
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IRoleGroup>|null} [role_groups] Guild role_groups
                     * @property {number|null} [guild_role_group] Guild guild_role_group
                     * @property {string|null} [guild_note_channel_id] Guild guild_note_channel_id
                     * @property {number|null} [announce_display] Guild announce_display
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce|null} [announce] Guild announce
                     */

                    /**
                     * Constructs a new Guild.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a Guild.
                     * @implements IGuild
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuild=} [properties] Properties to set
                     */
                    function Guild(properties) {
                        this.channel_lists = [];
                        this.emojis = [];
                        this.bot_receive = [];
                        this.feature_list = [];
                        this.topic_list = [];
                        this.related_application_list = [];
                        this.user_roles = [];
                        this.tags = [];
                        this.channels = [];
                        this.roles = [];
                        this.role_groups = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Guild guild_id.
                     * @member {number} guild_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.name = "";

                    /**
                     * Guild icon.
                     * @member {string} icon
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.icon = "";

                    /**
                     * Guild description.
                     * @member {string} description
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.description = "";

                    /**
                     * Guild owner_id.
                     * @member {number} owner_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.owner_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild permissions.
                     * @member {number} permissions
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.permissions = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild channel_lists.
                     * @member {Array.<number>} channel_lists
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.channel_lists = $util.emptyArray;

                    /**
                     * Guild system_channel_id.
                     * @member {number} system_channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.system_channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild system_channel_flags.
                     * @member {number} system_channel_flags
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.system_channel_flags = 0;

                    /**
                     * Guild system_channel_type.
                     * @member {number} system_channel_type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.system_channel_type = 0;

                    /**
                     * Guild system_channel_message.
                     * @member {string} system_channel_message
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.system_channel_message = "";

                    /**
                     * Guild system_channel_message_pic.
                     * @member {string} system_channel_message_pic
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.system_channel_message_pic = "";

                    /**
                     * Guild authenticate.
                     * @member {number} authenticate
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.authenticate = 0;

                    /**
                     * Guild authenticate_params.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams|null|undefined} authenticate_params
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.authenticate_params = null;

                    /**
                     * Guild banner.
                     * @member {string} banner
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.banner = "";

                    /**
                     * Guild emojis.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IEmoji>} emojis
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.emojis = $util.emptyArray;

                    /**
                     * Guild banned_level.
                     * @member {number} banned_level
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.banned_level = 0;

                    /**
                     * Guild verification_parameters.
                     * @member {string} verification_parameters
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.verification_parameters = "";

                    /**
                     * Guild verification_level.
                     * @member {number} verification_level
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.verification_level = 0;

                    /**
                     * Guild verification_auto_remove.
                     * @member {number} verification_auto_remove
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.verification_auto_remove = 0;

                    /**
                     * Guild bot_receive.
                     * @member {Array.<number>} bot_receive
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.bot_receive = $util.emptyArray;

                    /**
                     * Guild feature_list.
                     * @member {Array.<string>} feature_list
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.feature_list = $util.emptyArray;

                    /**
                     * Guild guild_push_threshold.
                     * @member {number} guild_push_threshold
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_push_threshold = 0;

                    /**
                     * Guild admin_permission.
                     * @member {number} admin_permission
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.admin_permission = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild guild_member_dm_friend_setting.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting|null|undefined} guild_member_dm_friend_setting
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_member_dm_friend_setting = null;

                    /**
                     * Guild normal_role_id.
                     * @member {number} normal_role_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.normal_role_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild normal_permission.
                     * @member {number} normal_permission
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.normal_permission = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild activity_calendar.
                     * @member {number} activity_calendar
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.activity_calendar = 0;

                    /**
                     * Guild colling_time.
                     * @member {number} colling_time
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.colling_time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild banner_config.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig|null|undefined} banner_config
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.banner_config = null;

                    /**
                     * Guild assist_display.
                     * @member {boolean} assist_display
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.assist_display = false;

                    /**
                     * Guild icon_dynamic.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic|null|undefined} icon_dynamic
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.icon_dynamic = null;

                    /**
                     * Guild template_id.
                     * @member {number} template_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.template_id = 0;

                    /**
                     * Guild guild_topic_display.
                     * @member {number} guild_topic_display
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_topic_display = 0;

                    /**
                     * Guild topic_list.
                     * @member {Array.<number>} topic_list
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.topic_list = $util.emptyArray;

                    /**
                     * Guild joined_at.
                     * @member {number} joined_at
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.joined_at = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild is_private.
                     * @member {number} is_private
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.is_private = 0;

                    /**
                     * Guild guild_circle_visible.
                     * @member {number} guild_circle_visible
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_circle_visible = 0;

                    /**
                     * Guild guild_circle_view.
                     * @member {number} guild_circle_view
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_circle_view = 0;

                    /**
                     * Guild guild_circle_comment.
                     * @member {number} guild_circle_comment
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_circle_comment = 0;

                    /**
                     * Guild guild_set_banner.
                     * @member {number} guild_set_banner
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_set_banner = 0;

                    /**
                     * Guild post_reward.
                     * @member {number} post_reward
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.post_reward = 0;

                    /**
                     * Guild upload_files.
                     * @member {number} upload_files
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.upload_files = 0;

                    /**
                     * Guild post_multi_para.
                     * @member {number} post_multi_para
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.post_multi_para = 0;

                    /**
                     * Guild related_application.
                     * @member {number} related_application
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.related_application = 0;

                    /**
                     * Guild related_application_list.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication>} related_application_list
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.related_application_list = $util.emptyArray;

                    /**
                     * Guild guild_search_config.
                     * @member {number} guild_search_config
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_search_config = 0;

                    /**
                     * Guild guild_search_allow.
                     * @member {number} guild_search_allow
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_search_allow = 0;

                    /**
                     * Guild user_roles.
                     * @member {Array.<number>} user_roles
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.user_roles = $util.emptyArray;

                    /**
                     * Guild notification_channel_id.
                     * @member {number} notification_channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.notification_channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild calendar_channel_id.
                     * @member {number} calendar_channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.calendar_channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild tags.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IGuildTag>} tags
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.tags = $util.emptyArray;

                    /**
                     * Guild circle.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle|null|undefined} circle
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.circle = null;

                    /**
                     * Guild gnick.
                     * @member {string} gnick
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.gnick = "";

                    /**
                     * Guild channels.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IChannel>} channels
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.channels = $util.emptyArray;

                    /**
                     * Guild roles.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IRole>} roles
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.roles = $util.emptyArray;

                    /**
                     * Guild user_pending.
                     * @member {boolean} user_pending
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.user_pending = false;

                    /**
                     * Guild no_say.
                     * @member {number} no_say
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.no_say = 0;

                    /**
                     * Guild circle_display.
                     * @member {boolean} circle_display
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.circle_display = false;

                    /**
                     * Guild vanity_url_code.
                     * @member {string} vanity_url_code
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.vanity_url_code = "";

                    /**
                     * Guild verification_remove_time.
                     * @member {number} verification_remove_time
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.verification_remove_time = 0;

                    /**
                     * Guild hierarchy.
                     * @member {number} hierarchy
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.hierarchy = 0;

                    /**
                     * Guild point.
                     * @member {number} point
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.point = 0;

                    /**
                     * Guild is_new_permission.
                     * @member {number} is_new_permission
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.is_new_permission = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Guild role_groups.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IRoleGroup>} role_groups
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.role_groups = $util.emptyArray;

                    /**
                     * Guild guild_role_group.
                     * @member {number} guild_role_group
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_role_group = 0;

                    /**
                     * Guild guild_note_channel_id.
                     * @member {string} guild_note_channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.guild_note_channel_id = "";

                    /**
                     * Guild announce_display.
                     * @member {number} announce_display
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.announce_display = 0;

                    /**
                     * Guild announce.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce|null|undefined} announce
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     */
                    Guild.prototype.announce = null;

                    /**
                     * Creates a new Guild instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuild=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Guild} Guild instance
                     */
                    Guild.create = function create(properties) {
                        return new Guild(properties);
                    };

                    /**
                     * Encodes the specified Guild message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Guild.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuild} message Guild message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Guild.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.guild_id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.icon);
                        if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
                        if (message.owner_id != null && Object.hasOwnProperty.call(message, "owner_id"))
                            writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.owner_id);
                        if (message.permissions != null && Object.hasOwnProperty.call(message, "permissions"))
                            writer.uint32(/* id 6, wireType 1 =*/49).fixed64(message.permissions);
                        if (message.channel_lists != null && message.channel_lists.length) {
                            writer.uint32(/* id 7, wireType 2 =*/58).fork();
                            for (let i = 0; i < message.channel_lists.length; ++i)
                                writer.fixed64(message.channel_lists[i]);
                            writer.ldelim();
                        }
                        if (message.system_channel_id != null && Object.hasOwnProperty.call(message, "system_channel_id"))
                            writer.uint32(/* id 8, wireType 1 =*/65).fixed64(message.system_channel_id);
                        if (message.system_channel_flags != null && Object.hasOwnProperty.call(message, "system_channel_flags"))
                            writer.uint32(/* id 9, wireType 0 =*/72).int32(message.system_channel_flags);
                        if (message.system_channel_type != null && Object.hasOwnProperty.call(message, "system_channel_type"))
                            writer.uint32(/* id 10, wireType 0 =*/80).int32(message.system_channel_type);
                        if (message.system_channel_message != null && Object.hasOwnProperty.call(message, "system_channel_message"))
                            writer.uint32(/* id 11, wireType 2 =*/90).string(message.system_channel_message);
                        if (message.system_channel_message_pic != null && Object.hasOwnProperty.call(message, "system_channel_message_pic"))
                            writer.uint32(/* id 12, wireType 2 =*/98).string(message.system_channel_message_pic);
                        if (message.authenticate != null && Object.hasOwnProperty.call(message, "authenticate"))
                            writer.uint32(/* id 13, wireType 0 =*/104).int32(message.authenticate);
                        if (message.authenticate_params != null && Object.hasOwnProperty.call(message, "authenticate_params"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.encode(message.authenticate_params, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
                        if (message.banner != null && Object.hasOwnProperty.call(message, "banner"))
                            writer.uint32(/* id 15, wireType 2 =*/122).string(message.banner);
                        if (message.emojis != null && message.emojis.length)
                            for (let i = 0; i < message.emojis.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.Emoji.encode(message.emojis[i], writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
                        if (message.banned_level != null && Object.hasOwnProperty.call(message, "banned_level"))
                            writer.uint32(/* id 17, wireType 0 =*/136).int32(message.banned_level);
                        if (message.verification_parameters != null && Object.hasOwnProperty.call(message, "verification_parameters"))
                            writer.uint32(/* id 18, wireType 2 =*/146).string(message.verification_parameters);
                        if (message.verification_level != null && Object.hasOwnProperty.call(message, "verification_level"))
                            writer.uint32(/* id 19, wireType 0 =*/152).int32(message.verification_level);
                        if (message.verification_auto_remove != null && Object.hasOwnProperty.call(message, "verification_auto_remove"))
                            writer.uint32(/* id 20, wireType 0 =*/160).int32(message.verification_auto_remove);
                        if (message.bot_receive != null && message.bot_receive.length) {
                            writer.uint32(/* id 21, wireType 2 =*/170).fork();
                            for (let i = 0; i < message.bot_receive.length; ++i)
                                writer.fixed64(message.bot_receive[i]);
                            writer.ldelim();
                        }
                        if (message.feature_list != null && message.feature_list.length)
                            for (let i = 0; i < message.feature_list.length; ++i)
                                writer.uint32(/* id 22, wireType 2 =*/178).string(message.feature_list[i]);
                        if (message.guild_push_threshold != null && Object.hasOwnProperty.call(message, "guild_push_threshold"))
                            writer.uint32(/* id 23, wireType 0 =*/184).int32(message.guild_push_threshold);
                        if (message.admin_permission != null && Object.hasOwnProperty.call(message, "admin_permission"))
                            writer.uint32(/* id 24, wireType 1 =*/193).fixed64(message.admin_permission);
                        if (message.guild_member_dm_friend_setting != null && Object.hasOwnProperty.call(message, "guild_member_dm_friend_setting"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.encode(message.guild_member_dm_friend_setting, writer.uint32(/* id 25, wireType 2 =*/202).fork()).ldelim();
                        if (message.normal_role_id != null && Object.hasOwnProperty.call(message, "normal_role_id"))
                            writer.uint32(/* id 26, wireType 1 =*/209).fixed64(message.normal_role_id);
                        if (message.normal_permission != null && Object.hasOwnProperty.call(message, "normal_permission"))
                            writer.uint32(/* id 27, wireType 1 =*/217).fixed64(message.normal_permission);
                        if (message.activity_calendar != null && Object.hasOwnProperty.call(message, "activity_calendar"))
                            writer.uint32(/* id 28, wireType 0 =*/224).int32(message.activity_calendar);
                        if (message.colling_time != null && Object.hasOwnProperty.call(message, "colling_time"))
                            writer.uint32(/* id 29, wireType 1 =*/233).fixed64(message.colling_time);
                        if (message.banner_config != null && Object.hasOwnProperty.call(message, "banner_config"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig.encode(message.banner_config, writer.uint32(/* id 30, wireType 2 =*/242).fork()).ldelim();
                        if (message.assist_display != null && Object.hasOwnProperty.call(message, "assist_display"))
                            writer.uint32(/* id 31, wireType 0 =*/248).bool(message.assist_display);
                        if (message.icon_dynamic != null && Object.hasOwnProperty.call(message, "icon_dynamic"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic.encode(message.icon_dynamic, writer.uint32(/* id 32, wireType 2 =*/258).fork()).ldelim();
                        if (message.template_id != null && Object.hasOwnProperty.call(message, "template_id"))
                            writer.uint32(/* id 33, wireType 0 =*/264).int32(message.template_id);
                        if (message.guild_topic_display != null && Object.hasOwnProperty.call(message, "guild_topic_display"))
                            writer.uint32(/* id 34, wireType 0 =*/272).int32(message.guild_topic_display);
                        if (message.topic_list != null && message.topic_list.length) {
                            writer.uint32(/* id 35, wireType 2 =*/282).fork();
                            for (let i = 0; i < message.topic_list.length; ++i)
                                writer.fixed64(message.topic_list[i]);
                            writer.ldelim();
                        }
                        if (message.joined_at != null && Object.hasOwnProperty.call(message, "joined_at"))
                            writer.uint32(/* id 36, wireType 1 =*/289).fixed64(message.joined_at);
                        if (message.is_private != null && Object.hasOwnProperty.call(message, "is_private"))
                            writer.uint32(/* id 37, wireType 0 =*/296).int32(message.is_private);
                        if (message.guild_circle_visible != null && Object.hasOwnProperty.call(message, "guild_circle_visible"))
                            writer.uint32(/* id 38, wireType 0 =*/304).int32(message.guild_circle_visible);
                        if (message.guild_circle_view != null && Object.hasOwnProperty.call(message, "guild_circle_view"))
                            writer.uint32(/* id 39, wireType 0 =*/312).int32(message.guild_circle_view);
                        if (message.guild_circle_comment != null && Object.hasOwnProperty.call(message, "guild_circle_comment"))
                            writer.uint32(/* id 40, wireType 0 =*/320).int32(message.guild_circle_comment);
                        if (message.guild_set_banner != null && Object.hasOwnProperty.call(message, "guild_set_banner"))
                            writer.uint32(/* id 41, wireType 0 =*/328).int32(message.guild_set_banner);
                        if (message.post_reward != null && Object.hasOwnProperty.call(message, "post_reward"))
                            writer.uint32(/* id 42, wireType 0 =*/336).int32(message.post_reward);
                        if (message.upload_files != null && Object.hasOwnProperty.call(message, "upload_files"))
                            writer.uint32(/* id 43, wireType 0 =*/344).int32(message.upload_files);
                        if (message.post_multi_para != null && Object.hasOwnProperty.call(message, "post_multi_para"))
                            writer.uint32(/* id 44, wireType 0 =*/352).int32(message.post_multi_para);
                        if (message.related_application != null && Object.hasOwnProperty.call(message, "related_application"))
                            writer.uint32(/* id 45, wireType 0 =*/360).int32(message.related_application);
                        if (message.related_application_list != null && message.related_application_list.length)
                            for (let i = 0; i < message.related_application_list.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.encode(message.related_application_list[i], writer.uint32(/* id 46, wireType 2 =*/370).fork()).ldelim();
                        if (message.guild_search_config != null && Object.hasOwnProperty.call(message, "guild_search_config"))
                            writer.uint32(/* id 47, wireType 0 =*/376).int32(message.guild_search_config);
                        if (message.guild_search_allow != null && Object.hasOwnProperty.call(message, "guild_search_allow"))
                            writer.uint32(/* id 48, wireType 0 =*/384).int32(message.guild_search_allow);
                        if (message.user_roles != null && message.user_roles.length) {
                            writer.uint32(/* id 49, wireType 2 =*/394).fork();
                            for (let i = 0; i < message.user_roles.length; ++i)
                                writer.fixed64(message.user_roles[i]);
                            writer.ldelim();
                        }
                        if (message.notification_channel_id != null && Object.hasOwnProperty.call(message, "notification_channel_id"))
                            writer.uint32(/* id 50, wireType 1 =*/401).fixed64(message.notification_channel_id);
                        if (message.calendar_channel_id != null && Object.hasOwnProperty.call(message, "calendar_channel_id"))
                            writer.uint32(/* id 51, wireType 1 =*/409).fixed64(message.calendar_channel_id);
                        if (message.tags != null && message.tags.length)
                            for (let i = 0; i < message.tags.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag.encode(message.tags[i], writer.uint32(/* id 52, wireType 2 =*/418).fork()).ldelim();
                        if (message.circle != null && Object.hasOwnProperty.call(message, "circle"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle.encode(message.circle, writer.uint32(/* id 53, wireType 2 =*/426).fork()).ldelim();
                        if (message.gnick != null && Object.hasOwnProperty.call(message, "gnick"))
                            writer.uint32(/* id 54, wireType 2 =*/434).string(message.gnick);
                        if (message.channels != null && message.channels.length)
                            for (let i = 0; i < message.channels.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.Channel.encode(message.channels[i], writer.uint32(/* id 55, wireType 2 =*/442).fork()).ldelim();
                        if (message.roles != null && message.roles.length)
                            for (let i = 0; i < message.roles.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.Role.encode(message.roles[i], writer.uint32(/* id 56, wireType 2 =*/450).fork()).ldelim();
                        if (message.user_pending != null && Object.hasOwnProperty.call(message, "user_pending"))
                            writer.uint32(/* id 57, wireType 0 =*/456).bool(message.user_pending);
                        if (message.no_say != null && Object.hasOwnProperty.call(message, "no_say"))
                            writer.uint32(/* id 58, wireType 0 =*/464).int32(message.no_say);
                        if (message.circle_display != null && Object.hasOwnProperty.call(message, "circle_display"))
                            writer.uint32(/* id 60, wireType 0 =*/480).bool(message.circle_display);
                        if (message.vanity_url_code != null && Object.hasOwnProperty.call(message, "vanity_url_code"))
                            writer.uint32(/* id 61, wireType 2 =*/490).string(message.vanity_url_code);
                        if (message.verification_remove_time != null && Object.hasOwnProperty.call(message, "verification_remove_time"))
                            writer.uint32(/* id 63, wireType 0 =*/504).int32(message.verification_remove_time);
                        if (message.hierarchy != null && Object.hasOwnProperty.call(message, "hierarchy"))
                            writer.uint32(/* id 64, wireType 0 =*/512).int32(message.hierarchy);
                        if (message.point != null && Object.hasOwnProperty.call(message, "point"))
                            writer.uint32(/* id 65, wireType 0 =*/520).int32(message.point);
                        if (message.is_new_permission != null && Object.hasOwnProperty.call(message, "is_new_permission"))
                            writer.uint32(/* id 66, wireType 1 =*/529).fixed64(message.is_new_permission);
                        if (message.role_groups != null && message.role_groups.length)
                            for (let i = 0; i < message.role_groups.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup.encode(message.role_groups[i], writer.uint32(/* id 67, wireType 2 =*/538).fork()).ldelim();
                        if (message.guild_role_group != null && Object.hasOwnProperty.call(message, "guild_role_group"))
                            writer.uint32(/* id 68, wireType 0 =*/544).int32(message.guild_role_group);
                        if (message.guild_note_channel_id != null && Object.hasOwnProperty.call(message, "guild_note_channel_id"))
                            writer.uint32(/* id 69, wireType 2 =*/554).string(message.guild_note_channel_id);
                        if (message.announce_display != null && Object.hasOwnProperty.call(message, "announce_display"))
                            writer.uint32(/* id 70, wireType 0 =*/560).int32(message.announce_display);
                        if (message.announce != null && Object.hasOwnProperty.call(message, "announce"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.encode(message.announce, writer.uint32(/* id 71, wireType 2 =*/570).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Guild message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Guild.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuild} message Guild message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Guild.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Guild message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Guild} Guild
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Guild.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.Guild();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.guild_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.icon = reader.string();
                                    break;
                                }
                            case 4: {
                                    message.description = reader.string();
                                    break;
                                }
                            case 5: {
                                    message.owner_id = reader.fixed64();
                                    break;
                                }
                            case 6: {
                                    message.permissions = reader.fixed64();
                                    break;
                                }
                            case 7: {
                                    if (!(message.channel_lists && message.channel_lists.length))
                                        message.channel_lists = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.channel_lists.push(reader.fixed64());
                                    } else
                                        message.channel_lists.push(reader.fixed64());
                                    break;
                                }
                            case 8: {
                                    message.system_channel_id = reader.fixed64();
                                    break;
                                }
                            case 9: {
                                    message.system_channel_flags = reader.int32();
                                    break;
                                }
                            case 10: {
                                    message.system_channel_type = reader.int32();
                                    break;
                                }
                            case 11: {
                                    message.system_channel_message = reader.string();
                                    break;
                                }
                            case 12: {
                                    message.system_channel_message_pic = reader.string();
                                    break;
                                }
                            case 13: {
                                    message.authenticate = reader.int32();
                                    break;
                                }
                            case 14: {
                                    message.authenticate_params = $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.decode(reader, reader.uint32());
                                    break;
                                }
                            case 15: {
                                    message.banner = reader.string();
                                    break;
                                }
                            case 16: {
                                    if (!(message.emojis && message.emojis.length))
                                        message.emojis = [];
                                    message.emojis.push($root.Protocols.Protobuf.PBClass.MyGuild.Emoji.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 17: {
                                    message.banned_level = reader.int32();
                                    break;
                                }
                            case 18: {
                                    message.verification_parameters = reader.string();
                                    break;
                                }
                            case 19: {
                                    message.verification_level = reader.int32();
                                    break;
                                }
                            case 20: {
                                    message.verification_auto_remove = reader.int32();
                                    break;
                                }
                            case 21: {
                                    if (!(message.bot_receive && message.bot_receive.length))
                                        message.bot_receive = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.bot_receive.push(reader.fixed64());
                                    } else
                                        message.bot_receive.push(reader.fixed64());
                                    break;
                                }
                            case 22: {
                                    if (!(message.feature_list && message.feature_list.length))
                                        message.feature_list = [];
                                    message.feature_list.push(reader.string());
                                    break;
                                }
                            case 23: {
                                    message.guild_push_threshold = reader.int32();
                                    break;
                                }
                            case 24: {
                                    message.admin_permission = reader.fixed64();
                                    break;
                                }
                            case 25: {
                                    message.guild_member_dm_friend_setting = $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.decode(reader, reader.uint32());
                                    break;
                                }
                            case 26: {
                                    message.normal_role_id = reader.fixed64();
                                    break;
                                }
                            case 27: {
                                    message.normal_permission = reader.fixed64();
                                    break;
                                }
                            case 28: {
                                    message.activity_calendar = reader.int32();
                                    break;
                                }
                            case 29: {
                                    message.colling_time = reader.fixed64();
                                    break;
                                }
                            case 30: {
                                    message.banner_config = $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig.decode(reader, reader.uint32());
                                    break;
                                }
                            case 31: {
                                    message.assist_display = reader.bool();
                                    break;
                                }
                            case 32: {
                                    message.icon_dynamic = $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic.decode(reader, reader.uint32());
                                    break;
                                }
                            case 33: {
                                    message.template_id = reader.int32();
                                    break;
                                }
                            case 34: {
                                    message.guild_topic_display = reader.int32();
                                    break;
                                }
                            case 35: {
                                    if (!(message.topic_list && message.topic_list.length))
                                        message.topic_list = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.topic_list.push(reader.fixed64());
                                    } else
                                        message.topic_list.push(reader.fixed64());
                                    break;
                                }
                            case 36: {
                                    message.joined_at = reader.fixed64();
                                    break;
                                }
                            case 37: {
                                    message.is_private = reader.int32();
                                    break;
                                }
                            case 38: {
                                    message.guild_circle_visible = reader.int32();
                                    break;
                                }
                            case 39: {
                                    message.guild_circle_view = reader.int32();
                                    break;
                                }
                            case 40: {
                                    message.guild_circle_comment = reader.int32();
                                    break;
                                }
                            case 41: {
                                    message.guild_set_banner = reader.int32();
                                    break;
                                }
                            case 42: {
                                    message.post_reward = reader.int32();
                                    break;
                                }
                            case 43: {
                                    message.upload_files = reader.int32();
                                    break;
                                }
                            case 44: {
                                    message.post_multi_para = reader.int32();
                                    break;
                                }
                            case 45: {
                                    message.related_application = reader.int32();
                                    break;
                                }
                            case 46: {
                                    if (!(message.related_application_list && message.related_application_list.length))
                                        message.related_application_list = [];
                                    message.related_application_list.push($root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 47: {
                                    message.guild_search_config = reader.int32();
                                    break;
                                }
                            case 48: {
                                    message.guild_search_allow = reader.int32();
                                    break;
                                }
                            case 49: {
                                    if (!(message.user_roles && message.user_roles.length))
                                        message.user_roles = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.user_roles.push(reader.fixed64());
                                    } else
                                        message.user_roles.push(reader.fixed64());
                                    break;
                                }
                            case 50: {
                                    message.notification_channel_id = reader.fixed64();
                                    break;
                                }
                            case 51: {
                                    message.calendar_channel_id = reader.fixed64();
                                    break;
                                }
                            case 52: {
                                    if (!(message.tags && message.tags.length))
                                        message.tags = [];
                                    message.tags.push($root.Protocols.Protobuf.PBClass.MyGuild.GuildTag.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 53: {
                                    message.circle = $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle.decode(reader, reader.uint32());
                                    break;
                                }
                            case 54: {
                                    message.gnick = reader.string();
                                    break;
                                }
                            case 55: {
                                    if (!(message.channels && message.channels.length))
                                        message.channels = [];
                                    message.channels.push($root.Protocols.Protobuf.PBClass.MyGuild.Channel.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 56: {
                                    if (!(message.roles && message.roles.length))
                                        message.roles = [];
                                    message.roles.push($root.Protocols.Protobuf.PBClass.MyGuild.Role.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 57: {
                                    message.user_pending = reader.bool();
                                    break;
                                }
                            case 58: {
                                    message.no_say = reader.int32();
                                    break;
                                }
                            case 60: {
                                    message.circle_display = reader.bool();
                                    break;
                                }
                            case 61: {
                                    message.vanity_url_code = reader.string();
                                    break;
                                }
                            case 63: {
                                    message.verification_remove_time = reader.int32();
                                    break;
                                }
                            case 64: {
                                    message.hierarchy = reader.int32();
                                    break;
                                }
                            case 65: {
                                    message.point = reader.int32();
                                    break;
                                }
                            case 66: {
                                    message.is_new_permission = reader.fixed64();
                                    break;
                                }
                            case 67: {
                                    if (!(message.role_groups && message.role_groups.length))
                                        message.role_groups = [];
                                    message.role_groups.push($root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 68: {
                                    message.guild_role_group = reader.int32();
                                    break;
                                }
                            case 69: {
                                    message.guild_note_channel_id = reader.string();
                                    break;
                                }
                            case 70: {
                                    message.announce_display = reader.int32();
                                    break;
                                }
                            case 71: {
                                    message.announce = $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Guild message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Guild} Guild
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Guild.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Guild message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Guild.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                                return "guild_id: integer|Long expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            if (!$util.isString(message.icon))
                                return "icon: string expected";
                        if (message.description != null && message.hasOwnProperty("description"))
                            if (!$util.isString(message.description))
                                return "description: string expected";
                        if (message.owner_id != null && message.hasOwnProperty("owner_id"))
                            if (!$util.isInteger(message.owner_id) && !(message.owner_id && $util.isInteger(message.owner_id.low) && $util.isInteger(message.owner_id.high)))
                                return "owner_id: integer|Long expected";
                        if (message.permissions != null && message.hasOwnProperty("permissions"))
                            if (!$util.isInteger(message.permissions) && !(message.permissions && $util.isInteger(message.permissions.low) && $util.isInteger(message.permissions.high)))
                                return "permissions: integer|Long expected";
                        if (message.channel_lists != null && message.hasOwnProperty("channel_lists")) {
                            if (!Array.isArray(message.channel_lists))
                                return "channel_lists: array expected";
                            for (let i = 0; i < message.channel_lists.length; ++i)
                                if (!$util.isInteger(message.channel_lists[i]) && !(message.channel_lists[i] && $util.isInteger(message.channel_lists[i].low) && $util.isInteger(message.channel_lists[i].high)))
                                    return "channel_lists: integer|Long[] expected";
                        }
                        if (message.system_channel_id != null && message.hasOwnProperty("system_channel_id"))
                            if (!$util.isInteger(message.system_channel_id) && !(message.system_channel_id && $util.isInteger(message.system_channel_id.low) && $util.isInteger(message.system_channel_id.high)))
                                return "system_channel_id: integer|Long expected";
                        if (message.system_channel_flags != null && message.hasOwnProperty("system_channel_flags"))
                            if (!$util.isInteger(message.system_channel_flags))
                                return "system_channel_flags: integer expected";
                        if (message.system_channel_type != null && message.hasOwnProperty("system_channel_type"))
                            if (!$util.isInteger(message.system_channel_type))
                                return "system_channel_type: integer expected";
                        if (message.system_channel_message != null && message.hasOwnProperty("system_channel_message"))
                            if (!$util.isString(message.system_channel_message))
                                return "system_channel_message: string expected";
                        if (message.system_channel_message_pic != null && message.hasOwnProperty("system_channel_message_pic"))
                            if (!$util.isString(message.system_channel_message_pic))
                                return "system_channel_message_pic: string expected";
                        if (message.authenticate != null && message.hasOwnProperty("authenticate"))
                            if (!$util.isInteger(message.authenticate))
                                return "authenticate: integer expected";
                        if (message.authenticate_params != null && message.hasOwnProperty("authenticate_params")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.verify(message.authenticate_params);
                            if (error)
                                return "authenticate_params." + error;
                        }
                        if (message.banner != null && message.hasOwnProperty("banner"))
                            if (!$util.isString(message.banner))
                                return "banner: string expected";
                        if (message.emojis != null && message.hasOwnProperty("emojis")) {
                            if (!Array.isArray(message.emojis))
                                return "emojis: array expected";
                            for (let i = 0; i < message.emojis.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.Emoji.verify(message.emojis[i]);
                                if (error)
                                    return "emojis." + error;
                            }
                        }
                        if (message.banned_level != null && message.hasOwnProperty("banned_level"))
                            if (!$util.isInteger(message.banned_level))
                                return "banned_level: integer expected";
                        if (message.verification_parameters != null && message.hasOwnProperty("verification_parameters"))
                            if (!$util.isString(message.verification_parameters))
                                return "verification_parameters: string expected";
                        if (message.verification_level != null && message.hasOwnProperty("verification_level"))
                            if (!$util.isInteger(message.verification_level))
                                return "verification_level: integer expected";
                        if (message.verification_auto_remove != null && message.hasOwnProperty("verification_auto_remove"))
                            if (!$util.isInteger(message.verification_auto_remove))
                                return "verification_auto_remove: integer expected";
                        if (message.bot_receive != null && message.hasOwnProperty("bot_receive")) {
                            if (!Array.isArray(message.bot_receive))
                                return "bot_receive: array expected";
                            for (let i = 0; i < message.bot_receive.length; ++i)
                                if (!$util.isInteger(message.bot_receive[i]) && !(message.bot_receive[i] && $util.isInteger(message.bot_receive[i].low) && $util.isInteger(message.bot_receive[i].high)))
                                    return "bot_receive: integer|Long[] expected";
                        }
                        if (message.feature_list != null && message.hasOwnProperty("feature_list")) {
                            if (!Array.isArray(message.feature_list))
                                return "feature_list: array expected";
                            for (let i = 0; i < message.feature_list.length; ++i)
                                if (!$util.isString(message.feature_list[i]))
                                    return "feature_list: string[] expected";
                        }
                        if (message.guild_push_threshold != null && message.hasOwnProperty("guild_push_threshold"))
                            if (!$util.isInteger(message.guild_push_threshold))
                                return "guild_push_threshold: integer expected";
                        if (message.admin_permission != null && message.hasOwnProperty("admin_permission"))
                            if (!$util.isInteger(message.admin_permission) && !(message.admin_permission && $util.isInteger(message.admin_permission.low) && $util.isInteger(message.admin_permission.high)))
                                return "admin_permission: integer|Long expected";
                        if (message.guild_member_dm_friend_setting != null && message.hasOwnProperty("guild_member_dm_friend_setting")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.verify(message.guild_member_dm_friend_setting);
                            if (error)
                                return "guild_member_dm_friend_setting." + error;
                        }
                        if (message.normal_role_id != null && message.hasOwnProperty("normal_role_id"))
                            if (!$util.isInteger(message.normal_role_id) && !(message.normal_role_id && $util.isInteger(message.normal_role_id.low) && $util.isInteger(message.normal_role_id.high)))
                                return "normal_role_id: integer|Long expected";
                        if (message.normal_permission != null && message.hasOwnProperty("normal_permission"))
                            if (!$util.isInteger(message.normal_permission) && !(message.normal_permission && $util.isInteger(message.normal_permission.low) && $util.isInteger(message.normal_permission.high)))
                                return "normal_permission: integer|Long expected";
                        if (message.activity_calendar != null && message.hasOwnProperty("activity_calendar"))
                            if (!$util.isInteger(message.activity_calendar))
                                return "activity_calendar: integer expected";
                        if (message.colling_time != null && message.hasOwnProperty("colling_time"))
                            if (!$util.isInteger(message.colling_time) && !(message.colling_time && $util.isInteger(message.colling_time.low) && $util.isInteger(message.colling_time.high)))
                                return "colling_time: integer|Long expected";
                        if (message.banner_config != null && message.hasOwnProperty("banner_config")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig.verify(message.banner_config);
                            if (error)
                                return "banner_config." + error;
                        }
                        if (message.assist_display != null && message.hasOwnProperty("assist_display"))
                            if (typeof message.assist_display !== "boolean")
                                return "assist_display: boolean expected";
                        if (message.icon_dynamic != null && message.hasOwnProperty("icon_dynamic")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic.verify(message.icon_dynamic);
                            if (error)
                                return "icon_dynamic." + error;
                        }
                        if (message.template_id != null && message.hasOwnProperty("template_id"))
                            if (!$util.isInteger(message.template_id))
                                return "template_id: integer expected";
                        if (message.guild_topic_display != null && message.hasOwnProperty("guild_topic_display"))
                            if (!$util.isInteger(message.guild_topic_display))
                                return "guild_topic_display: integer expected";
                        if (message.topic_list != null && message.hasOwnProperty("topic_list")) {
                            if (!Array.isArray(message.topic_list))
                                return "topic_list: array expected";
                            for (let i = 0; i < message.topic_list.length; ++i)
                                if (!$util.isInteger(message.topic_list[i]) && !(message.topic_list[i] && $util.isInteger(message.topic_list[i].low) && $util.isInteger(message.topic_list[i].high)))
                                    return "topic_list: integer|Long[] expected";
                        }
                        if (message.joined_at != null && message.hasOwnProperty("joined_at"))
                            if (!$util.isInteger(message.joined_at) && !(message.joined_at && $util.isInteger(message.joined_at.low) && $util.isInteger(message.joined_at.high)))
                                return "joined_at: integer|Long expected";
                        if (message.is_private != null && message.hasOwnProperty("is_private"))
                            if (!$util.isInteger(message.is_private))
                                return "is_private: integer expected";
                        if (message.guild_circle_visible != null && message.hasOwnProperty("guild_circle_visible"))
                            if (!$util.isInteger(message.guild_circle_visible))
                                return "guild_circle_visible: integer expected";
                        if (message.guild_circle_view != null && message.hasOwnProperty("guild_circle_view"))
                            if (!$util.isInteger(message.guild_circle_view))
                                return "guild_circle_view: integer expected";
                        if (message.guild_circle_comment != null && message.hasOwnProperty("guild_circle_comment"))
                            if (!$util.isInteger(message.guild_circle_comment))
                                return "guild_circle_comment: integer expected";
                        if (message.guild_set_banner != null && message.hasOwnProperty("guild_set_banner"))
                            if (!$util.isInteger(message.guild_set_banner))
                                return "guild_set_banner: integer expected";
                        if (message.post_reward != null && message.hasOwnProperty("post_reward"))
                            if (!$util.isInteger(message.post_reward))
                                return "post_reward: integer expected";
                        if (message.upload_files != null && message.hasOwnProperty("upload_files"))
                            if (!$util.isInteger(message.upload_files))
                                return "upload_files: integer expected";
                        if (message.post_multi_para != null && message.hasOwnProperty("post_multi_para"))
                            if (!$util.isInteger(message.post_multi_para))
                                return "post_multi_para: integer expected";
                        if (message.related_application != null && message.hasOwnProperty("related_application"))
                            if (!$util.isInteger(message.related_application))
                                return "related_application: integer expected";
                        if (message.related_application_list != null && message.hasOwnProperty("related_application_list")) {
                            if (!Array.isArray(message.related_application_list))
                                return "related_application_list: array expected";
                            for (let i = 0; i < message.related_application_list.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.verify(message.related_application_list[i]);
                                if (error)
                                    return "related_application_list." + error;
                            }
                        }
                        if (message.guild_search_config != null && message.hasOwnProperty("guild_search_config"))
                            if (!$util.isInteger(message.guild_search_config))
                                return "guild_search_config: integer expected";
                        if (message.guild_search_allow != null && message.hasOwnProperty("guild_search_allow"))
                            if (!$util.isInteger(message.guild_search_allow))
                                return "guild_search_allow: integer expected";
                        if (message.user_roles != null && message.hasOwnProperty("user_roles")) {
                            if (!Array.isArray(message.user_roles))
                                return "user_roles: array expected";
                            for (let i = 0; i < message.user_roles.length; ++i)
                                if (!$util.isInteger(message.user_roles[i]) && !(message.user_roles[i] && $util.isInteger(message.user_roles[i].low) && $util.isInteger(message.user_roles[i].high)))
                                    return "user_roles: integer|Long[] expected";
                        }
                        if (message.notification_channel_id != null && message.hasOwnProperty("notification_channel_id"))
                            if (!$util.isInteger(message.notification_channel_id) && !(message.notification_channel_id && $util.isInteger(message.notification_channel_id.low) && $util.isInteger(message.notification_channel_id.high)))
                                return "notification_channel_id: integer|Long expected";
                        if (message.calendar_channel_id != null && message.hasOwnProperty("calendar_channel_id"))
                            if (!$util.isInteger(message.calendar_channel_id) && !(message.calendar_channel_id && $util.isInteger(message.calendar_channel_id.low) && $util.isInteger(message.calendar_channel_id.high)))
                                return "calendar_channel_id: integer|Long expected";
                        if (message.tags != null && message.hasOwnProperty("tags")) {
                            if (!Array.isArray(message.tags))
                                return "tags: array expected";
                            for (let i = 0; i < message.tags.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag.verify(message.tags[i]);
                                if (error)
                                    return "tags." + error;
                            }
                        }
                        if (message.circle != null && message.hasOwnProperty("circle")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle.verify(message.circle);
                            if (error)
                                return "circle." + error;
                        }
                        if (message.gnick != null && message.hasOwnProperty("gnick"))
                            if (!$util.isString(message.gnick))
                                return "gnick: string expected";
                        if (message.channels != null && message.hasOwnProperty("channels")) {
                            if (!Array.isArray(message.channels))
                                return "channels: array expected";
                            for (let i = 0; i < message.channels.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.Channel.verify(message.channels[i]);
                                if (error)
                                    return "channels." + error;
                            }
                        }
                        if (message.roles != null && message.hasOwnProperty("roles")) {
                            if (!Array.isArray(message.roles))
                                return "roles: array expected";
                            for (let i = 0; i < message.roles.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.Role.verify(message.roles[i]);
                                if (error)
                                    return "roles." + error;
                            }
                        }
                        if (message.user_pending != null && message.hasOwnProperty("user_pending"))
                            if (typeof message.user_pending !== "boolean")
                                return "user_pending: boolean expected";
                        if (message.no_say != null && message.hasOwnProperty("no_say"))
                            if (!$util.isInteger(message.no_say))
                                return "no_say: integer expected";
                        if (message.circle_display != null && message.hasOwnProperty("circle_display"))
                            if (typeof message.circle_display !== "boolean")
                                return "circle_display: boolean expected";
                        if (message.vanity_url_code != null && message.hasOwnProperty("vanity_url_code"))
                            if (!$util.isString(message.vanity_url_code))
                                return "vanity_url_code: string expected";
                        if (message.verification_remove_time != null && message.hasOwnProperty("verification_remove_time"))
                            if (!$util.isInteger(message.verification_remove_time))
                                return "verification_remove_time: integer expected";
                        if (message.hierarchy != null && message.hasOwnProperty("hierarchy"))
                            if (!$util.isInteger(message.hierarchy))
                                return "hierarchy: integer expected";
                        if (message.point != null && message.hasOwnProperty("point"))
                            if (!$util.isInteger(message.point))
                                return "point: integer expected";
                        if (message.is_new_permission != null && message.hasOwnProperty("is_new_permission"))
                            if (!$util.isInteger(message.is_new_permission) && !(message.is_new_permission && $util.isInteger(message.is_new_permission.low) && $util.isInteger(message.is_new_permission.high)))
                                return "is_new_permission: integer|Long expected";
                        if (message.role_groups != null && message.hasOwnProperty("role_groups")) {
                            if (!Array.isArray(message.role_groups))
                                return "role_groups: array expected";
                            for (let i = 0; i < message.role_groups.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup.verify(message.role_groups[i]);
                                if (error)
                                    return "role_groups." + error;
                            }
                        }
                        if (message.guild_role_group != null && message.hasOwnProperty("guild_role_group"))
                            if (!$util.isInteger(message.guild_role_group))
                                return "guild_role_group: integer expected";
                        if (message.guild_note_channel_id != null && message.hasOwnProperty("guild_note_channel_id"))
                            if (!$util.isString(message.guild_note_channel_id))
                                return "guild_note_channel_id: string expected";
                        if (message.announce_display != null && message.hasOwnProperty("announce_display"))
                            if (!$util.isInteger(message.announce_display))
                                return "announce_display: integer expected";
                        if (message.announce != null && message.hasOwnProperty("announce")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.verify(message.announce);
                            if (error)
                                return "announce." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a Guild message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Guild} Guild
                     */
                    Guild.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.Guild)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.Guild();
                        if (object.guild_id != null)
                            if ($util.Long)
                                (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                            else if (typeof object.guild_id === "string")
                                message.guild_id = parseInt(object.guild_id, 10);
                            else if (typeof object.guild_id === "number")
                                message.guild_id = object.guild_id;
                            else if (typeof object.guild_id === "object")
                                message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.icon != null)
                            message.icon = String(object.icon);
                        if (object.description != null)
                            message.description = String(object.description);
                        if (object.owner_id != null)
                            if ($util.Long)
                                (message.owner_id = $util.Long.fromValue(object.owner_id)).unsigned = false;
                            else if (typeof object.owner_id === "string")
                                message.owner_id = parseInt(object.owner_id, 10);
                            else if (typeof object.owner_id === "number")
                                message.owner_id = object.owner_id;
                            else if (typeof object.owner_id === "object")
                                message.owner_id = new $util.LongBits(object.owner_id.low >>> 0, object.owner_id.high >>> 0).toNumber();
                        if (object.permissions != null)
                            if ($util.Long)
                                (message.permissions = $util.Long.fromValue(object.permissions)).unsigned = false;
                            else if (typeof object.permissions === "string")
                                message.permissions = parseInt(object.permissions, 10);
                            else if (typeof object.permissions === "number")
                                message.permissions = object.permissions;
                            else if (typeof object.permissions === "object")
                                message.permissions = new $util.LongBits(object.permissions.low >>> 0, object.permissions.high >>> 0).toNumber();
                        if (object.channel_lists) {
                            if (!Array.isArray(object.channel_lists))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.channel_lists: array expected");
                            message.channel_lists = [];
                            for (let i = 0; i < object.channel_lists.length; ++i)
                                if ($util.Long)
                                    (message.channel_lists[i] = $util.Long.fromValue(object.channel_lists[i])).unsigned = false;
                                else if (typeof object.channel_lists[i] === "string")
                                    message.channel_lists[i] = parseInt(object.channel_lists[i], 10);
                                else if (typeof object.channel_lists[i] === "number")
                                    message.channel_lists[i] = object.channel_lists[i];
                                else if (typeof object.channel_lists[i] === "object")
                                    message.channel_lists[i] = new $util.LongBits(object.channel_lists[i].low >>> 0, object.channel_lists[i].high >>> 0).toNumber();
                        }
                        if (object.system_channel_id != null)
                            if ($util.Long)
                                (message.system_channel_id = $util.Long.fromValue(object.system_channel_id)).unsigned = false;
                            else if (typeof object.system_channel_id === "string")
                                message.system_channel_id = parseInt(object.system_channel_id, 10);
                            else if (typeof object.system_channel_id === "number")
                                message.system_channel_id = object.system_channel_id;
                            else if (typeof object.system_channel_id === "object")
                                message.system_channel_id = new $util.LongBits(object.system_channel_id.low >>> 0, object.system_channel_id.high >>> 0).toNumber();
                        if (object.system_channel_flags != null)
                            message.system_channel_flags = object.system_channel_flags | 0;
                        if (object.system_channel_type != null)
                            message.system_channel_type = object.system_channel_type | 0;
                        if (object.system_channel_message != null)
                            message.system_channel_message = String(object.system_channel_message);
                        if (object.system_channel_message_pic != null)
                            message.system_channel_message_pic = String(object.system_channel_message_pic);
                        if (object.authenticate != null)
                            message.authenticate = object.authenticate | 0;
                        if (object.authenticate_params != null) {
                            if (typeof object.authenticate_params !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.authenticate_params: object expected");
                            message.authenticate_params = $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.fromObject(object.authenticate_params);
                        }
                        if (object.banner != null)
                            message.banner = String(object.banner);
                        if (object.emojis) {
                            if (!Array.isArray(object.emojis))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.emojis: array expected");
                            message.emojis = [];
                            for (let i = 0; i < object.emojis.length; ++i) {
                                if (typeof object.emojis[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.emojis: object expected");
                                message.emojis[i] = $root.Protocols.Protobuf.PBClass.MyGuild.Emoji.fromObject(object.emojis[i]);
                            }
                        }
                        if (object.banned_level != null)
                            message.banned_level = object.banned_level | 0;
                        if (object.verification_parameters != null)
                            message.verification_parameters = String(object.verification_parameters);
                        if (object.verification_level != null)
                            message.verification_level = object.verification_level | 0;
                        if (object.verification_auto_remove != null)
                            message.verification_auto_remove = object.verification_auto_remove | 0;
                        if (object.bot_receive) {
                            if (!Array.isArray(object.bot_receive))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.bot_receive: array expected");
                            message.bot_receive = [];
                            for (let i = 0; i < object.bot_receive.length; ++i)
                                if ($util.Long)
                                    (message.bot_receive[i] = $util.Long.fromValue(object.bot_receive[i])).unsigned = false;
                                else if (typeof object.bot_receive[i] === "string")
                                    message.bot_receive[i] = parseInt(object.bot_receive[i], 10);
                                else if (typeof object.bot_receive[i] === "number")
                                    message.bot_receive[i] = object.bot_receive[i];
                                else if (typeof object.bot_receive[i] === "object")
                                    message.bot_receive[i] = new $util.LongBits(object.bot_receive[i].low >>> 0, object.bot_receive[i].high >>> 0).toNumber();
                        }
                        if (object.feature_list) {
                            if (!Array.isArray(object.feature_list))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.feature_list: array expected");
                            message.feature_list = [];
                            for (let i = 0; i < object.feature_list.length; ++i)
                                message.feature_list[i] = String(object.feature_list[i]);
                        }
                        if (object.guild_push_threshold != null)
                            message.guild_push_threshold = object.guild_push_threshold | 0;
                        if (object.admin_permission != null)
                            if ($util.Long)
                                (message.admin_permission = $util.Long.fromValue(object.admin_permission)).unsigned = false;
                            else if (typeof object.admin_permission === "string")
                                message.admin_permission = parseInt(object.admin_permission, 10);
                            else if (typeof object.admin_permission === "number")
                                message.admin_permission = object.admin_permission;
                            else if (typeof object.admin_permission === "object")
                                message.admin_permission = new $util.LongBits(object.admin_permission.low >>> 0, object.admin_permission.high >>> 0).toNumber();
                        if (object.guild_member_dm_friend_setting != null) {
                            if (typeof object.guild_member_dm_friend_setting !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.guild_member_dm_friend_setting: object expected");
                            message.guild_member_dm_friend_setting = $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.fromObject(object.guild_member_dm_friend_setting);
                        }
                        if (object.normal_role_id != null)
                            if ($util.Long)
                                (message.normal_role_id = $util.Long.fromValue(object.normal_role_id)).unsigned = false;
                            else if (typeof object.normal_role_id === "string")
                                message.normal_role_id = parseInt(object.normal_role_id, 10);
                            else if (typeof object.normal_role_id === "number")
                                message.normal_role_id = object.normal_role_id;
                            else if (typeof object.normal_role_id === "object")
                                message.normal_role_id = new $util.LongBits(object.normal_role_id.low >>> 0, object.normal_role_id.high >>> 0).toNumber();
                        if (object.normal_permission != null)
                            if ($util.Long)
                                (message.normal_permission = $util.Long.fromValue(object.normal_permission)).unsigned = false;
                            else if (typeof object.normal_permission === "string")
                                message.normal_permission = parseInt(object.normal_permission, 10);
                            else if (typeof object.normal_permission === "number")
                                message.normal_permission = object.normal_permission;
                            else if (typeof object.normal_permission === "object")
                                message.normal_permission = new $util.LongBits(object.normal_permission.low >>> 0, object.normal_permission.high >>> 0).toNumber();
                        if (object.activity_calendar != null)
                            message.activity_calendar = object.activity_calendar | 0;
                        if (object.colling_time != null)
                            if ($util.Long)
                                (message.colling_time = $util.Long.fromValue(object.colling_time)).unsigned = false;
                            else if (typeof object.colling_time === "string")
                                message.colling_time = parseInt(object.colling_time, 10);
                            else if (typeof object.colling_time === "number")
                                message.colling_time = object.colling_time;
                            else if (typeof object.colling_time === "object")
                                message.colling_time = new $util.LongBits(object.colling_time.low >>> 0, object.colling_time.high >>> 0).toNumber();
                        if (object.banner_config != null) {
                            if (typeof object.banner_config !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.banner_config: object expected");
                            message.banner_config = $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig.fromObject(object.banner_config);
                        }
                        if (object.assist_display != null)
                            message.assist_display = Boolean(object.assist_display);
                        if (object.icon_dynamic != null) {
                            if (typeof object.icon_dynamic !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.icon_dynamic: object expected");
                            message.icon_dynamic = $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic.fromObject(object.icon_dynamic);
                        }
                        if (object.template_id != null)
                            message.template_id = object.template_id | 0;
                        if (object.guild_topic_display != null)
                            message.guild_topic_display = object.guild_topic_display | 0;
                        if (object.topic_list) {
                            if (!Array.isArray(object.topic_list))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.topic_list: array expected");
                            message.topic_list = [];
                            for (let i = 0; i < object.topic_list.length; ++i)
                                if ($util.Long)
                                    (message.topic_list[i] = $util.Long.fromValue(object.topic_list[i])).unsigned = false;
                                else if (typeof object.topic_list[i] === "string")
                                    message.topic_list[i] = parseInt(object.topic_list[i], 10);
                                else if (typeof object.topic_list[i] === "number")
                                    message.topic_list[i] = object.topic_list[i];
                                else if (typeof object.topic_list[i] === "object")
                                    message.topic_list[i] = new $util.LongBits(object.topic_list[i].low >>> 0, object.topic_list[i].high >>> 0).toNumber();
                        }
                        if (object.joined_at != null)
                            if ($util.Long)
                                (message.joined_at = $util.Long.fromValue(object.joined_at)).unsigned = false;
                            else if (typeof object.joined_at === "string")
                                message.joined_at = parseInt(object.joined_at, 10);
                            else if (typeof object.joined_at === "number")
                                message.joined_at = object.joined_at;
                            else if (typeof object.joined_at === "object")
                                message.joined_at = new $util.LongBits(object.joined_at.low >>> 0, object.joined_at.high >>> 0).toNumber();
                        if (object.is_private != null)
                            message.is_private = object.is_private | 0;
                        if (object.guild_circle_visible != null)
                            message.guild_circle_visible = object.guild_circle_visible | 0;
                        if (object.guild_circle_view != null)
                            message.guild_circle_view = object.guild_circle_view | 0;
                        if (object.guild_circle_comment != null)
                            message.guild_circle_comment = object.guild_circle_comment | 0;
                        if (object.guild_set_banner != null)
                            message.guild_set_banner = object.guild_set_banner | 0;
                        if (object.post_reward != null)
                            message.post_reward = object.post_reward | 0;
                        if (object.upload_files != null)
                            message.upload_files = object.upload_files | 0;
                        if (object.post_multi_para != null)
                            message.post_multi_para = object.post_multi_para | 0;
                        if (object.related_application != null)
                            message.related_application = object.related_application | 0;
                        if (object.related_application_list) {
                            if (!Array.isArray(object.related_application_list))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.related_application_list: array expected");
                            message.related_application_list = [];
                            for (let i = 0; i < object.related_application_list.length; ++i) {
                                if (typeof object.related_application_list[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.related_application_list: object expected");
                                message.related_application_list[i] = $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.fromObject(object.related_application_list[i]);
                            }
                        }
                        if (object.guild_search_config != null)
                            message.guild_search_config = object.guild_search_config | 0;
                        if (object.guild_search_allow != null)
                            message.guild_search_allow = object.guild_search_allow | 0;
                        if (object.user_roles) {
                            if (!Array.isArray(object.user_roles))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.user_roles: array expected");
                            message.user_roles = [];
                            for (let i = 0; i < object.user_roles.length; ++i)
                                if ($util.Long)
                                    (message.user_roles[i] = $util.Long.fromValue(object.user_roles[i])).unsigned = false;
                                else if (typeof object.user_roles[i] === "string")
                                    message.user_roles[i] = parseInt(object.user_roles[i], 10);
                                else if (typeof object.user_roles[i] === "number")
                                    message.user_roles[i] = object.user_roles[i];
                                else if (typeof object.user_roles[i] === "object")
                                    message.user_roles[i] = new $util.LongBits(object.user_roles[i].low >>> 0, object.user_roles[i].high >>> 0).toNumber();
                        }
                        if (object.notification_channel_id != null)
                            if ($util.Long)
                                (message.notification_channel_id = $util.Long.fromValue(object.notification_channel_id)).unsigned = false;
                            else if (typeof object.notification_channel_id === "string")
                                message.notification_channel_id = parseInt(object.notification_channel_id, 10);
                            else if (typeof object.notification_channel_id === "number")
                                message.notification_channel_id = object.notification_channel_id;
                            else if (typeof object.notification_channel_id === "object")
                                message.notification_channel_id = new $util.LongBits(object.notification_channel_id.low >>> 0, object.notification_channel_id.high >>> 0).toNumber();
                        if (object.calendar_channel_id != null)
                            if ($util.Long)
                                (message.calendar_channel_id = $util.Long.fromValue(object.calendar_channel_id)).unsigned = false;
                            else if (typeof object.calendar_channel_id === "string")
                                message.calendar_channel_id = parseInt(object.calendar_channel_id, 10);
                            else if (typeof object.calendar_channel_id === "number")
                                message.calendar_channel_id = object.calendar_channel_id;
                            else if (typeof object.calendar_channel_id === "object")
                                message.calendar_channel_id = new $util.LongBits(object.calendar_channel_id.low >>> 0, object.calendar_channel_id.high >>> 0).toNumber();
                        if (object.tags) {
                            if (!Array.isArray(object.tags))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.tags: array expected");
                            message.tags = [];
                            for (let i = 0; i < object.tags.length; ++i) {
                                if (typeof object.tags[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.tags: object expected");
                                message.tags[i] = $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag.fromObject(object.tags[i]);
                            }
                        }
                        if (object.circle != null) {
                            if (typeof object.circle !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.circle: object expected");
                            message.circle = $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle.fromObject(object.circle);
                        }
                        if (object.gnick != null)
                            message.gnick = String(object.gnick);
                        if (object.channels) {
                            if (!Array.isArray(object.channels))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.channels: array expected");
                            message.channels = [];
                            for (let i = 0; i < object.channels.length; ++i) {
                                if (typeof object.channels[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.channels: object expected");
                                message.channels[i] = $root.Protocols.Protobuf.PBClass.MyGuild.Channel.fromObject(object.channels[i]);
                            }
                        }
                        if (object.roles) {
                            if (!Array.isArray(object.roles))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.roles: array expected");
                            message.roles = [];
                            for (let i = 0; i < object.roles.length; ++i) {
                                if (typeof object.roles[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.roles: object expected");
                                message.roles[i] = $root.Protocols.Protobuf.PBClass.MyGuild.Role.fromObject(object.roles[i]);
                            }
                        }
                        if (object.user_pending != null)
                            message.user_pending = Boolean(object.user_pending);
                        if (object.no_say != null)
                            message.no_say = object.no_say | 0;
                        if (object.circle_display != null)
                            message.circle_display = Boolean(object.circle_display);
                        if (object.vanity_url_code != null)
                            message.vanity_url_code = String(object.vanity_url_code);
                        if (object.verification_remove_time != null)
                            message.verification_remove_time = object.verification_remove_time | 0;
                        if (object.hierarchy != null)
                            message.hierarchy = object.hierarchy | 0;
                        if (object.point != null)
                            message.point = object.point | 0;
                        if (object.is_new_permission != null)
                            if ($util.Long)
                                (message.is_new_permission = $util.Long.fromValue(object.is_new_permission)).unsigned = false;
                            else if (typeof object.is_new_permission === "string")
                                message.is_new_permission = parseInt(object.is_new_permission, 10);
                            else if (typeof object.is_new_permission === "number")
                                message.is_new_permission = object.is_new_permission;
                            else if (typeof object.is_new_permission === "object")
                                message.is_new_permission = new $util.LongBits(object.is_new_permission.low >>> 0, object.is_new_permission.high >>> 0).toNumber();
                        if (object.role_groups) {
                            if (!Array.isArray(object.role_groups))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.role_groups: array expected");
                            message.role_groups = [];
                            for (let i = 0; i < object.role_groups.length; ++i) {
                                if (typeof object.role_groups[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.role_groups: object expected");
                                message.role_groups[i] = $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup.fromObject(object.role_groups[i]);
                            }
                        }
                        if (object.guild_role_group != null)
                            message.guild_role_group = object.guild_role_group | 0;
                        if (object.guild_note_channel_id != null)
                            message.guild_note_channel_id = String(object.guild_note_channel_id);
                        if (object.announce_display != null)
                            message.announce_display = object.announce_display | 0;
                        if (object.announce != null) {
                            if (typeof object.announce !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Guild.announce: object expected");
                            message.announce = $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.fromObject(object.announce);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Guild message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.Guild} message Guild
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Guild.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.channel_lists = [];
                            object.emojis = [];
                            object.bot_receive = [];
                            object.feature_list = [];
                            object.topic_list = [];
                            object.related_application_list = [];
                            object.user_roles = [];
                            object.tags = [];
                            object.channels = [];
                            object.roles = [];
                            object.role_groups = [];
                        }
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.guild_id = options.longs === String ? "0" : 0;
                            object.name = "";
                            object.icon = "";
                            object.description = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.owner_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.owner_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.permissions = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.permissions = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.system_channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.system_channel_id = options.longs === String ? "0" : 0;
                            object.system_channel_flags = 0;
                            object.system_channel_type = 0;
                            object.system_channel_message = "";
                            object.system_channel_message_pic = "";
                            object.authenticate = 0;
                            object.authenticate_params = null;
                            object.banner = "";
                            object.banned_level = 0;
                            object.verification_parameters = "";
                            object.verification_level = 0;
                            object.verification_auto_remove = 0;
                            object.guild_push_threshold = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.admin_permission = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.admin_permission = options.longs === String ? "0" : 0;
                            object.guild_member_dm_friend_setting = null;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.normal_role_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.normal_role_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.normal_permission = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.normal_permission = options.longs === String ? "0" : 0;
                            object.activity_calendar = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.colling_time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.colling_time = options.longs === String ? "0" : 0;
                            object.banner_config = null;
                            object.assist_display = false;
                            object.icon_dynamic = null;
                            object.template_id = 0;
                            object.guild_topic_display = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.joined_at = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.joined_at = options.longs === String ? "0" : 0;
                            object.is_private = 0;
                            object.guild_circle_visible = 0;
                            object.guild_circle_view = 0;
                            object.guild_circle_comment = 0;
                            object.guild_set_banner = 0;
                            object.post_reward = 0;
                            object.upload_files = 0;
                            object.post_multi_para = 0;
                            object.related_application = 0;
                            object.guild_search_config = 0;
                            object.guild_search_allow = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.notification_channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.notification_channel_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.calendar_channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.calendar_channel_id = options.longs === String ? "0" : 0;
                            object.circle = null;
                            object.gnick = "";
                            object.user_pending = false;
                            object.no_say = 0;
                            object.circle_display = false;
                            object.vanity_url_code = "";
                            object.verification_remove_time = 0;
                            object.hierarchy = 0;
                            object.point = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.is_new_permission = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.is_new_permission = options.longs === String ? "0" : 0;
                            object.guild_role_group = 0;
                            object.guild_note_channel_id = "";
                            object.announce_display = 0;
                            object.announce = null;
                        }
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (typeof message.guild_id === "number")
                                object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                            else
                                object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            object.icon = message.icon;
                        if (message.description != null && message.hasOwnProperty("description"))
                            object.description = message.description;
                        if (message.owner_id != null && message.hasOwnProperty("owner_id"))
                            if (typeof message.owner_id === "number")
                                object.owner_id = options.longs === String ? String(message.owner_id) : message.owner_id;
                            else
                                object.owner_id = options.longs === String ? $util.Long.prototype.toString.call(message.owner_id) : options.longs === Number ? new $util.LongBits(message.owner_id.low >>> 0, message.owner_id.high >>> 0).toNumber() : message.owner_id;
                        if (message.permissions != null && message.hasOwnProperty("permissions"))
                            if (typeof message.permissions === "number")
                                object.permissions = options.longs === String ? String(message.permissions) : message.permissions;
                            else
                                object.permissions = options.longs === String ? $util.Long.prototype.toString.call(message.permissions) : options.longs === Number ? new $util.LongBits(message.permissions.low >>> 0, message.permissions.high >>> 0).toNumber() : message.permissions;
                        if (message.channel_lists && message.channel_lists.length) {
                            object.channel_lists = [];
                            for (let j = 0; j < message.channel_lists.length; ++j)
                                if (typeof message.channel_lists[j] === "number")
                                    object.channel_lists[j] = options.longs === String ? String(message.channel_lists[j]) : message.channel_lists[j];
                                else
                                    object.channel_lists[j] = options.longs === String ? $util.Long.prototype.toString.call(message.channel_lists[j]) : options.longs === Number ? new $util.LongBits(message.channel_lists[j].low >>> 0, message.channel_lists[j].high >>> 0).toNumber() : message.channel_lists[j];
                        }
                        if (message.system_channel_id != null && message.hasOwnProperty("system_channel_id"))
                            if (typeof message.system_channel_id === "number")
                                object.system_channel_id = options.longs === String ? String(message.system_channel_id) : message.system_channel_id;
                            else
                                object.system_channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.system_channel_id) : options.longs === Number ? new $util.LongBits(message.system_channel_id.low >>> 0, message.system_channel_id.high >>> 0).toNumber() : message.system_channel_id;
                        if (message.system_channel_flags != null && message.hasOwnProperty("system_channel_flags"))
                            object.system_channel_flags = message.system_channel_flags;
                        if (message.system_channel_type != null && message.hasOwnProperty("system_channel_type"))
                            object.system_channel_type = message.system_channel_type;
                        if (message.system_channel_message != null && message.hasOwnProperty("system_channel_message"))
                            object.system_channel_message = message.system_channel_message;
                        if (message.system_channel_message_pic != null && message.hasOwnProperty("system_channel_message_pic"))
                            object.system_channel_message_pic = message.system_channel_message_pic;
                        if (message.authenticate != null && message.hasOwnProperty("authenticate"))
                            object.authenticate = message.authenticate;
                        if (message.authenticate_params != null && message.hasOwnProperty("authenticate_params"))
                            object.authenticate_params = $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.toObject(message.authenticate_params, options);
                        if (message.banner != null && message.hasOwnProperty("banner"))
                            object.banner = message.banner;
                        if (message.emojis && message.emojis.length) {
                            object.emojis = [];
                            for (let j = 0; j < message.emojis.length; ++j)
                                object.emojis[j] = $root.Protocols.Protobuf.PBClass.MyGuild.Emoji.toObject(message.emojis[j], options);
                        }
                        if (message.banned_level != null && message.hasOwnProperty("banned_level"))
                            object.banned_level = message.banned_level;
                        if (message.verification_parameters != null && message.hasOwnProperty("verification_parameters"))
                            object.verification_parameters = message.verification_parameters;
                        if (message.verification_level != null && message.hasOwnProperty("verification_level"))
                            object.verification_level = message.verification_level;
                        if (message.verification_auto_remove != null && message.hasOwnProperty("verification_auto_remove"))
                            object.verification_auto_remove = message.verification_auto_remove;
                        if (message.bot_receive && message.bot_receive.length) {
                            object.bot_receive = [];
                            for (let j = 0; j < message.bot_receive.length; ++j)
                                if (typeof message.bot_receive[j] === "number")
                                    object.bot_receive[j] = options.longs === String ? String(message.bot_receive[j]) : message.bot_receive[j];
                                else
                                    object.bot_receive[j] = options.longs === String ? $util.Long.prototype.toString.call(message.bot_receive[j]) : options.longs === Number ? new $util.LongBits(message.bot_receive[j].low >>> 0, message.bot_receive[j].high >>> 0).toNumber() : message.bot_receive[j];
                        }
                        if (message.feature_list && message.feature_list.length) {
                            object.feature_list = [];
                            for (let j = 0; j < message.feature_list.length; ++j)
                                object.feature_list[j] = message.feature_list[j];
                        }
                        if (message.guild_push_threshold != null && message.hasOwnProperty("guild_push_threshold"))
                            object.guild_push_threshold = message.guild_push_threshold;
                        if (message.admin_permission != null && message.hasOwnProperty("admin_permission"))
                            if (typeof message.admin_permission === "number")
                                object.admin_permission = options.longs === String ? String(message.admin_permission) : message.admin_permission;
                            else
                                object.admin_permission = options.longs === String ? $util.Long.prototype.toString.call(message.admin_permission) : options.longs === Number ? new $util.LongBits(message.admin_permission.low >>> 0, message.admin_permission.high >>> 0).toNumber() : message.admin_permission;
                        if (message.guild_member_dm_friend_setting != null && message.hasOwnProperty("guild_member_dm_friend_setting"))
                            object.guild_member_dm_friend_setting = $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.toObject(message.guild_member_dm_friend_setting, options);
                        if (message.normal_role_id != null && message.hasOwnProperty("normal_role_id"))
                            if (typeof message.normal_role_id === "number")
                                object.normal_role_id = options.longs === String ? String(message.normal_role_id) : message.normal_role_id;
                            else
                                object.normal_role_id = options.longs === String ? $util.Long.prototype.toString.call(message.normal_role_id) : options.longs === Number ? new $util.LongBits(message.normal_role_id.low >>> 0, message.normal_role_id.high >>> 0).toNumber() : message.normal_role_id;
                        if (message.normal_permission != null && message.hasOwnProperty("normal_permission"))
                            if (typeof message.normal_permission === "number")
                                object.normal_permission = options.longs === String ? String(message.normal_permission) : message.normal_permission;
                            else
                                object.normal_permission = options.longs === String ? $util.Long.prototype.toString.call(message.normal_permission) : options.longs === Number ? new $util.LongBits(message.normal_permission.low >>> 0, message.normal_permission.high >>> 0).toNumber() : message.normal_permission;
                        if (message.activity_calendar != null && message.hasOwnProperty("activity_calendar"))
                            object.activity_calendar = message.activity_calendar;
                        if (message.colling_time != null && message.hasOwnProperty("colling_time"))
                            if (typeof message.colling_time === "number")
                                object.colling_time = options.longs === String ? String(message.colling_time) : message.colling_time;
                            else
                                object.colling_time = options.longs === String ? $util.Long.prototype.toString.call(message.colling_time) : options.longs === Number ? new $util.LongBits(message.colling_time.low >>> 0, message.colling_time.high >>> 0).toNumber() : message.colling_time;
                        if (message.banner_config != null && message.hasOwnProperty("banner_config"))
                            object.banner_config = $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig.toObject(message.banner_config, options);
                        if (message.assist_display != null && message.hasOwnProperty("assist_display"))
                            object.assist_display = message.assist_display;
                        if (message.icon_dynamic != null && message.hasOwnProperty("icon_dynamic"))
                            object.icon_dynamic = $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic.toObject(message.icon_dynamic, options);
                        if (message.template_id != null && message.hasOwnProperty("template_id"))
                            object.template_id = message.template_id;
                        if (message.guild_topic_display != null && message.hasOwnProperty("guild_topic_display"))
                            object.guild_topic_display = message.guild_topic_display;
                        if (message.topic_list && message.topic_list.length) {
                            object.topic_list = [];
                            for (let j = 0; j < message.topic_list.length; ++j)
                                if (typeof message.topic_list[j] === "number")
                                    object.topic_list[j] = options.longs === String ? String(message.topic_list[j]) : message.topic_list[j];
                                else
                                    object.topic_list[j] = options.longs === String ? $util.Long.prototype.toString.call(message.topic_list[j]) : options.longs === Number ? new $util.LongBits(message.topic_list[j].low >>> 0, message.topic_list[j].high >>> 0).toNumber() : message.topic_list[j];
                        }
                        if (message.joined_at != null && message.hasOwnProperty("joined_at"))
                            if (typeof message.joined_at === "number")
                                object.joined_at = options.longs === String ? String(message.joined_at) : message.joined_at;
                            else
                                object.joined_at = options.longs === String ? $util.Long.prototype.toString.call(message.joined_at) : options.longs === Number ? new $util.LongBits(message.joined_at.low >>> 0, message.joined_at.high >>> 0).toNumber() : message.joined_at;
                        if (message.is_private != null && message.hasOwnProperty("is_private"))
                            object.is_private = message.is_private;
                        if (message.guild_circle_visible != null && message.hasOwnProperty("guild_circle_visible"))
                            object.guild_circle_visible = message.guild_circle_visible;
                        if (message.guild_circle_view != null && message.hasOwnProperty("guild_circle_view"))
                            object.guild_circle_view = message.guild_circle_view;
                        if (message.guild_circle_comment != null && message.hasOwnProperty("guild_circle_comment"))
                            object.guild_circle_comment = message.guild_circle_comment;
                        if (message.guild_set_banner != null && message.hasOwnProperty("guild_set_banner"))
                            object.guild_set_banner = message.guild_set_banner;
                        if (message.post_reward != null && message.hasOwnProperty("post_reward"))
                            object.post_reward = message.post_reward;
                        if (message.upload_files != null && message.hasOwnProperty("upload_files"))
                            object.upload_files = message.upload_files;
                        if (message.post_multi_para != null && message.hasOwnProperty("post_multi_para"))
                            object.post_multi_para = message.post_multi_para;
                        if (message.related_application != null && message.hasOwnProperty("related_application"))
                            object.related_application = message.related_application;
                        if (message.related_application_list && message.related_application_list.length) {
                            object.related_application_list = [];
                            for (let j = 0; j < message.related_application_list.length; ++j)
                                object.related_application_list[j] = $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.toObject(message.related_application_list[j], options);
                        }
                        if (message.guild_search_config != null && message.hasOwnProperty("guild_search_config"))
                            object.guild_search_config = message.guild_search_config;
                        if (message.guild_search_allow != null && message.hasOwnProperty("guild_search_allow"))
                            object.guild_search_allow = message.guild_search_allow;
                        if (message.user_roles && message.user_roles.length) {
                            object.user_roles = [];
                            for (let j = 0; j < message.user_roles.length; ++j)
                                if (typeof message.user_roles[j] === "number")
                                    object.user_roles[j] = options.longs === String ? String(message.user_roles[j]) : message.user_roles[j];
                                else
                                    object.user_roles[j] = options.longs === String ? $util.Long.prototype.toString.call(message.user_roles[j]) : options.longs === Number ? new $util.LongBits(message.user_roles[j].low >>> 0, message.user_roles[j].high >>> 0).toNumber() : message.user_roles[j];
                        }
                        if (message.notification_channel_id != null && message.hasOwnProperty("notification_channel_id"))
                            if (typeof message.notification_channel_id === "number")
                                object.notification_channel_id = options.longs === String ? String(message.notification_channel_id) : message.notification_channel_id;
                            else
                                object.notification_channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.notification_channel_id) : options.longs === Number ? new $util.LongBits(message.notification_channel_id.low >>> 0, message.notification_channel_id.high >>> 0).toNumber() : message.notification_channel_id;
                        if (message.calendar_channel_id != null && message.hasOwnProperty("calendar_channel_id"))
                            if (typeof message.calendar_channel_id === "number")
                                object.calendar_channel_id = options.longs === String ? String(message.calendar_channel_id) : message.calendar_channel_id;
                            else
                                object.calendar_channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.calendar_channel_id) : options.longs === Number ? new $util.LongBits(message.calendar_channel_id.low >>> 0, message.calendar_channel_id.high >>> 0).toNumber() : message.calendar_channel_id;
                        if (message.tags && message.tags.length) {
                            object.tags = [];
                            for (let j = 0; j < message.tags.length; ++j)
                                object.tags[j] = $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag.toObject(message.tags[j], options);
                        }
                        if (message.circle != null && message.hasOwnProperty("circle"))
                            object.circle = $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle.toObject(message.circle, options);
                        if (message.gnick != null && message.hasOwnProperty("gnick"))
                            object.gnick = message.gnick;
                        if (message.channels && message.channels.length) {
                            object.channels = [];
                            for (let j = 0; j < message.channels.length; ++j)
                                object.channels[j] = $root.Protocols.Protobuf.PBClass.MyGuild.Channel.toObject(message.channels[j], options);
                        }
                        if (message.roles && message.roles.length) {
                            object.roles = [];
                            for (let j = 0; j < message.roles.length; ++j)
                                object.roles[j] = $root.Protocols.Protobuf.PBClass.MyGuild.Role.toObject(message.roles[j], options);
                        }
                        if (message.user_pending != null && message.hasOwnProperty("user_pending"))
                            object.user_pending = message.user_pending;
                        if (message.no_say != null && message.hasOwnProperty("no_say"))
                            object.no_say = message.no_say;
                        if (message.circle_display != null && message.hasOwnProperty("circle_display"))
                            object.circle_display = message.circle_display;
                        if (message.vanity_url_code != null && message.hasOwnProperty("vanity_url_code"))
                            object.vanity_url_code = message.vanity_url_code;
                        if (message.verification_remove_time != null && message.hasOwnProperty("verification_remove_time"))
                            object.verification_remove_time = message.verification_remove_time;
                        if (message.hierarchy != null && message.hasOwnProperty("hierarchy"))
                            object.hierarchy = message.hierarchy;
                        if (message.point != null && message.hasOwnProperty("point"))
                            object.point = message.point;
                        if (message.is_new_permission != null && message.hasOwnProperty("is_new_permission"))
                            if (typeof message.is_new_permission === "number")
                                object.is_new_permission = options.longs === String ? String(message.is_new_permission) : message.is_new_permission;
                            else
                                object.is_new_permission = options.longs === String ? $util.Long.prototype.toString.call(message.is_new_permission) : options.longs === Number ? new $util.LongBits(message.is_new_permission.low >>> 0, message.is_new_permission.high >>> 0).toNumber() : message.is_new_permission;
                        if (message.role_groups && message.role_groups.length) {
                            object.role_groups = [];
                            for (let j = 0; j < message.role_groups.length; ++j)
                                object.role_groups[j] = $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup.toObject(message.role_groups[j], options);
                        }
                        if (message.guild_role_group != null && message.hasOwnProperty("guild_role_group"))
                            object.guild_role_group = message.guild_role_group;
                        if (message.guild_note_channel_id != null && message.hasOwnProperty("guild_note_channel_id"))
                            object.guild_note_channel_id = message.guild_note_channel_id;
                        if (message.announce_display != null && message.hasOwnProperty("announce_display"))
                            object.announce_display = message.announce_display;
                        if (message.announce != null && message.hasOwnProperty("announce"))
                            object.announce = $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.toObject(message.announce, options);
                        return object;
                    };

                    /**
                     * Converts this Guild to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Guild.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Guild
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Guild
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Guild.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.Guild";
                    };

                    return Guild;
                })();

                MyGuild.AuthenticateParams = (function() {

                    /**
                     * Properties of an AuthenticateParams.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IAuthenticateParams
                     * @property {number|null} [account_bind] AuthenticateParams account_bind
                     * @property {string|null} [account_bind_url] AuthenticateParams account_bind_url
                     */

                    /**
                     * Constructs a new AuthenticateParams.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents an AuthenticateParams.
                     * @implements IAuthenticateParams
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams=} [properties] Properties to set
                     */
                    function AuthenticateParams(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * AuthenticateParams account_bind.
                     * @member {number} account_bind
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @instance
                     */
                    AuthenticateParams.prototype.account_bind = 0;

                    /**
                     * AuthenticateParams account_bind_url.
                     * @member {string} account_bind_url
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @instance
                     */
                    AuthenticateParams.prototype.account_bind_url = "";

                    /**
                     * Creates a new AuthenticateParams instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams} AuthenticateParams instance
                     */
                    AuthenticateParams.create = function create(properties) {
                        return new AuthenticateParams(properties);
                    };

                    /**
                     * Encodes the specified AuthenticateParams message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams} message AuthenticateParams message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AuthenticateParams.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.account_bind != null && Object.hasOwnProperty.call(message, "account_bind"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.account_bind);
                        if (message.account_bind_url != null && Object.hasOwnProperty.call(message, "account_bind_url"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.account_bind_url);
                        return writer;
                    };

                    /**
                     * Encodes the specified AuthenticateParams message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAuthenticateParams} message AuthenticateParams message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AuthenticateParams.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an AuthenticateParams message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams} AuthenticateParams
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AuthenticateParams.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.account_bind = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.account_bind_url = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an AuthenticateParams message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams} AuthenticateParams
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AuthenticateParams.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an AuthenticateParams message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    AuthenticateParams.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.account_bind != null && message.hasOwnProperty("account_bind"))
                            if (!$util.isInteger(message.account_bind))
                                return "account_bind: integer expected";
                        if (message.account_bind_url != null && message.hasOwnProperty("account_bind_url"))
                            if (!$util.isString(message.account_bind_url))
                                return "account_bind_url: string expected";
                        return null;
                    };

                    /**
                     * Creates an AuthenticateParams message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams} AuthenticateParams
                     */
                    AuthenticateParams.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams();
                        if (object.account_bind != null)
                            message.account_bind = object.account_bind | 0;
                        if (object.account_bind_url != null)
                            message.account_bind_url = String(object.account_bind_url);
                        return message;
                    };

                    /**
                     * Creates a plain object from an AuthenticateParams message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams} message AuthenticateParams
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    AuthenticateParams.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.account_bind = 0;
                            object.account_bind_url = "";
                        }
                        if (message.account_bind != null && message.hasOwnProperty("account_bind"))
                            object.account_bind = message.account_bind;
                        if (message.account_bind_url != null && message.hasOwnProperty("account_bind_url"))
                            object.account_bind_url = message.account_bind_url;
                        return object;
                    };

                    /**
                     * Converts this AuthenticateParams to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    AuthenticateParams.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for AuthenticateParams
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    AuthenticateParams.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.AuthenticateParams";
                    };

                    return AuthenticateParams;
                })();

                MyGuild.Emoji = (function() {

                    /**
                     * Properties of an Emoji.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IEmoji
                     * @property {string|null} [avatar] Emoji avatar
                     * @property {string|null} [name] Emoji name
                     * @property {number|null} [w] Emoji w
                     * @property {number|null} [h] Emoji h
                     * @property {number|null} [position] Emoji position
                     * @property {number|null} [group_id] Emoji group_id
                     * @property {string|null} [group_name] Emoji group_name
                     * @property {number|null} [group_position] Emoji group_position
                     */

                    /**
                     * Constructs a new Emoji.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents an Emoji.
                     * @implements IEmoji
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IEmoji=} [properties] Properties to set
                     */
                    function Emoji(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Emoji avatar.
                     * @member {string} avatar
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.avatar = "";

                    /**
                     * Emoji name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.name = "";

                    /**
                     * Emoji w.
                     * @member {number} w
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.w = 0;

                    /**
                     * Emoji h.
                     * @member {number} h
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.h = 0;

                    /**
                     * Emoji position.
                     * @member {number} position
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.position = 0;

                    /**
                     * Emoji group_id.
                     * @member {number} group_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.group_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Emoji group_name.
                     * @member {string} group_name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.group_name = "";

                    /**
                     * Emoji group_position.
                     * @member {number} group_position
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     */
                    Emoji.prototype.group_position = 0;

                    /**
                     * Creates a new Emoji instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IEmoji=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Emoji} Emoji instance
                     */
                    Emoji.create = function create(properties) {
                        return new Emoji(properties);
                    };

                    /**
                     * Encodes the specified Emoji message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Emoji.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IEmoji} message Emoji message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Emoji.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.avatar != null && Object.hasOwnProperty.call(message, "avatar"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.avatar);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.w != null && Object.hasOwnProperty.call(message, "w"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.w);
                        if (message.h != null && Object.hasOwnProperty.call(message, "h"))
                            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.h);
                        if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.position);
                        if (message.group_id != null && Object.hasOwnProperty.call(message, "group_id"))
                            writer.uint32(/* id 6, wireType 1 =*/49).fixed64(message.group_id);
                        if (message.group_name != null && Object.hasOwnProperty.call(message, "group_name"))
                            writer.uint32(/* id 7, wireType 2 =*/58).string(message.group_name);
                        if (message.group_position != null && Object.hasOwnProperty.call(message, "group_position"))
                            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.group_position);
                        return writer;
                    };

                    /**
                     * Encodes the specified Emoji message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Emoji.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IEmoji} message Emoji message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Emoji.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Emoji message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Emoji} Emoji
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Emoji.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.Emoji();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.avatar = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.w = reader.int32();
                                    break;
                                }
                            case 4: {
                                    message.h = reader.int32();
                                    break;
                                }
                            case 5: {
                                    message.position = reader.int32();
                                    break;
                                }
                            case 6: {
                                    message.group_id = reader.fixed64();
                                    break;
                                }
                            case 7: {
                                    message.group_name = reader.string();
                                    break;
                                }
                            case 8: {
                                    message.group_position = reader.int32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Emoji message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Emoji} Emoji
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Emoji.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Emoji message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Emoji.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.avatar != null && message.hasOwnProperty("avatar"))
                            if (!$util.isString(message.avatar))
                                return "avatar: string expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.w != null && message.hasOwnProperty("w"))
                            if (!$util.isInteger(message.w))
                                return "w: integer expected";
                        if (message.h != null && message.hasOwnProperty("h"))
                            if (!$util.isInteger(message.h))
                                return "h: integer expected";
                        if (message.position != null && message.hasOwnProperty("position"))
                            if (!$util.isInteger(message.position))
                                return "position: integer expected";
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (!$util.isInteger(message.group_id) && !(message.group_id && $util.isInteger(message.group_id.low) && $util.isInteger(message.group_id.high)))
                                return "group_id: integer|Long expected";
                        if (message.group_name != null && message.hasOwnProperty("group_name"))
                            if (!$util.isString(message.group_name))
                                return "group_name: string expected";
                        if (message.group_position != null && message.hasOwnProperty("group_position"))
                            if (!$util.isInteger(message.group_position))
                                return "group_position: integer expected";
                        return null;
                    };

                    /**
                     * Creates an Emoji message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Emoji} Emoji
                     */
                    Emoji.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.Emoji)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.Emoji();
                        if (object.avatar != null)
                            message.avatar = String(object.avatar);
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.w != null)
                            message.w = object.w | 0;
                        if (object.h != null)
                            message.h = object.h | 0;
                        if (object.position != null)
                            message.position = object.position | 0;
                        if (object.group_id != null)
                            if ($util.Long)
                                (message.group_id = $util.Long.fromValue(object.group_id)).unsigned = false;
                            else if (typeof object.group_id === "string")
                                message.group_id = parseInt(object.group_id, 10);
                            else if (typeof object.group_id === "number")
                                message.group_id = object.group_id;
                            else if (typeof object.group_id === "object")
                                message.group_id = new $util.LongBits(object.group_id.low >>> 0, object.group_id.high >>> 0).toNumber();
                        if (object.group_name != null)
                            message.group_name = String(object.group_name);
                        if (object.group_position != null)
                            message.group_position = object.group_position | 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from an Emoji message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.Emoji} message Emoji
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Emoji.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.avatar = "";
                            object.name = "";
                            object.w = 0;
                            object.h = 0;
                            object.position = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.group_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.group_id = options.longs === String ? "0" : 0;
                            object.group_name = "";
                            object.group_position = 0;
                        }
                        if (message.avatar != null && message.hasOwnProperty("avatar"))
                            object.avatar = message.avatar;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.w != null && message.hasOwnProperty("w"))
                            object.w = message.w;
                        if (message.h != null && message.hasOwnProperty("h"))
                            object.h = message.h;
                        if (message.position != null && message.hasOwnProperty("position"))
                            object.position = message.position;
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (typeof message.group_id === "number")
                                object.group_id = options.longs === String ? String(message.group_id) : message.group_id;
                            else
                                object.group_id = options.longs === String ? $util.Long.prototype.toString.call(message.group_id) : options.longs === Number ? new $util.LongBits(message.group_id.low >>> 0, message.group_id.high >>> 0).toNumber() : message.group_id;
                        if (message.group_name != null && message.hasOwnProperty("group_name"))
                            object.group_name = message.group_name;
                        if (message.group_position != null && message.hasOwnProperty("group_position"))
                            object.group_position = message.group_position;
                        return object;
                    };

                    /**
                     * Converts this Emoji to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Emoji.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Emoji
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Emoji
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Emoji.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.Emoji";
                    };

                    return Emoji;
                })();

                MyGuild.VerificationParameters = (function() {

                    /**
                     * Properties of a VerificationParameters.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IVerificationParameters
                     * @property {string|null} [url] VerificationParameters url
                     * @property {string|null} [title] VerificationParameters title
                     */

                    /**
                     * Constructs a new VerificationParameters.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a VerificationParameters.
                     * @implements IVerificationParameters
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IVerificationParameters=} [properties] Properties to set
                     */
                    function VerificationParameters(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * VerificationParameters url.
                     * @member {string} url
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @instance
                     */
                    VerificationParameters.prototype.url = "";

                    /**
                     * VerificationParameters title.
                     * @member {string} title
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @instance
                     */
                    VerificationParameters.prototype.title = "";

                    /**
                     * Creates a new VerificationParameters instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IVerificationParameters=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.VerificationParameters} VerificationParameters instance
                     */
                    VerificationParameters.create = function create(properties) {
                        return new VerificationParameters(properties);
                    };

                    /**
                     * Encodes the specified VerificationParameters message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.VerificationParameters.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IVerificationParameters} message VerificationParameters message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    VerificationParameters.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.url != null && Object.hasOwnProperty.call(message, "url"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.url);
                        if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                        return writer;
                    };

                    /**
                     * Encodes the specified VerificationParameters message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.VerificationParameters.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IVerificationParameters} message VerificationParameters message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    VerificationParameters.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a VerificationParameters message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.VerificationParameters} VerificationParameters
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    VerificationParameters.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.VerificationParameters();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.url = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.title = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a VerificationParameters message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.VerificationParameters} VerificationParameters
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    VerificationParameters.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a VerificationParameters message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    VerificationParameters.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.url != null && message.hasOwnProperty("url"))
                            if (!$util.isString(message.url))
                                return "url: string expected";
                        if (message.title != null && message.hasOwnProperty("title"))
                            if (!$util.isString(message.title))
                                return "title: string expected";
                        return null;
                    };

                    /**
                     * Creates a VerificationParameters message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.VerificationParameters} VerificationParameters
                     */
                    VerificationParameters.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.VerificationParameters)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.VerificationParameters();
                        if (object.url != null)
                            message.url = String(object.url);
                        if (object.title != null)
                            message.title = String(object.title);
                        return message;
                    };

                    /**
                     * Creates a plain object from a VerificationParameters message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.VerificationParameters} message VerificationParameters
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    VerificationParameters.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.url = "";
                            object.title = "";
                        }
                        if (message.url != null && message.hasOwnProperty("url"))
                            object.url = message.url;
                        if (message.title != null && message.hasOwnProperty("title"))
                            object.title = message.title;
                        return object;
                    };

                    /**
                     * Converts this VerificationParameters to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    VerificationParameters.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for VerificationParameters
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.VerificationParameters
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    VerificationParameters.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.VerificationParameters";
                    };

                    return VerificationParameters;
                })();

                MyGuild.GuildMemberDmFriendSetting = (function() {

                    /**
                     * Properties of a GuildMemberDmFriendSetting.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IGuildMemberDmFriendSetting
                     * @property {number|null} [dm_switch] GuildMemberDmFriendSetting dm_switch
                     * @property {Array.<number>|null} [dm_allow_roles] GuildMemberDmFriendSetting dm_allow_roles
                     * @property {number|null} [friend_switch] GuildMemberDmFriendSetting friend_switch
                     * @property {Array.<number>|null} [friend_allow_roles] GuildMemberDmFriendSetting friend_allow_roles
                     */

                    /**
                     * Constructs a new GuildMemberDmFriendSetting.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a GuildMemberDmFriendSetting.
                     * @implements IGuildMemberDmFriendSetting
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting=} [properties] Properties to set
                     */
                    function GuildMemberDmFriendSetting(properties) {
                        this.dm_allow_roles = [];
                        this.friend_allow_roles = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GuildMemberDmFriendSetting dm_switch.
                     * @member {number} dm_switch
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @instance
                     */
                    GuildMemberDmFriendSetting.prototype.dm_switch = 0;

                    /**
                     * GuildMemberDmFriendSetting dm_allow_roles.
                     * @member {Array.<number>} dm_allow_roles
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @instance
                     */
                    GuildMemberDmFriendSetting.prototype.dm_allow_roles = $util.emptyArray;

                    /**
                     * GuildMemberDmFriendSetting friend_switch.
                     * @member {number} friend_switch
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @instance
                     */
                    GuildMemberDmFriendSetting.prototype.friend_switch = 0;

                    /**
                     * GuildMemberDmFriendSetting friend_allow_roles.
                     * @member {Array.<number>} friend_allow_roles
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @instance
                     */
                    GuildMemberDmFriendSetting.prototype.friend_allow_roles = $util.emptyArray;

                    /**
                     * Creates a new GuildMemberDmFriendSetting instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting} GuildMemberDmFriendSetting instance
                     */
                    GuildMemberDmFriendSetting.create = function create(properties) {
                        return new GuildMemberDmFriendSetting(properties);
                    };

                    /**
                     * Encodes the specified GuildMemberDmFriendSetting message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting} message GuildMemberDmFriendSetting message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildMemberDmFriendSetting.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.dm_switch != null && Object.hasOwnProperty.call(message, "dm_switch"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.dm_switch);
                        if (message.dm_allow_roles != null && message.dm_allow_roles.length) {
                            writer.uint32(/* id 2, wireType 2 =*/18).fork();
                            for (let i = 0; i < message.dm_allow_roles.length; ++i)
                                writer.fixed64(message.dm_allow_roles[i]);
                            writer.ldelim();
                        }
                        if (message.friend_switch != null && Object.hasOwnProperty.call(message, "friend_switch"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.friend_switch);
                        if (message.friend_allow_roles != null && message.friend_allow_roles.length) {
                            writer.uint32(/* id 4, wireType 2 =*/34).fork();
                            for (let i = 0; i < message.friend_allow_roles.length; ++i)
                                writer.fixed64(message.friend_allow_roles[i]);
                            writer.ldelim();
                        }
                        return writer;
                    };

                    /**
                     * Encodes the specified GuildMemberDmFriendSetting message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildMemberDmFriendSetting} message GuildMemberDmFriendSetting message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildMemberDmFriendSetting.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GuildMemberDmFriendSetting message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting} GuildMemberDmFriendSetting
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildMemberDmFriendSetting.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.dm_switch = reader.int32();
                                    break;
                                }
                            case 2: {
                                    if (!(message.dm_allow_roles && message.dm_allow_roles.length))
                                        message.dm_allow_roles = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.dm_allow_roles.push(reader.fixed64());
                                    } else
                                        message.dm_allow_roles.push(reader.fixed64());
                                    break;
                                }
                            case 3: {
                                    message.friend_switch = reader.int32();
                                    break;
                                }
                            case 4: {
                                    if (!(message.friend_allow_roles && message.friend_allow_roles.length))
                                        message.friend_allow_roles = [];
                                    if ((tag & 7) === 2) {
                                        let end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.friend_allow_roles.push(reader.fixed64());
                                    } else
                                        message.friend_allow_roles.push(reader.fixed64());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GuildMemberDmFriendSetting message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting} GuildMemberDmFriendSetting
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildMemberDmFriendSetting.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GuildMemberDmFriendSetting message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GuildMemberDmFriendSetting.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.dm_switch != null && message.hasOwnProperty("dm_switch"))
                            if (!$util.isInteger(message.dm_switch))
                                return "dm_switch: integer expected";
                        if (message.dm_allow_roles != null && message.hasOwnProperty("dm_allow_roles")) {
                            if (!Array.isArray(message.dm_allow_roles))
                                return "dm_allow_roles: array expected";
                            for (let i = 0; i < message.dm_allow_roles.length; ++i)
                                if (!$util.isInteger(message.dm_allow_roles[i]) && !(message.dm_allow_roles[i] && $util.isInteger(message.dm_allow_roles[i].low) && $util.isInteger(message.dm_allow_roles[i].high)))
                                    return "dm_allow_roles: integer|Long[] expected";
                        }
                        if (message.friend_switch != null && message.hasOwnProperty("friend_switch"))
                            if (!$util.isInteger(message.friend_switch))
                                return "friend_switch: integer expected";
                        if (message.friend_allow_roles != null && message.hasOwnProperty("friend_allow_roles")) {
                            if (!Array.isArray(message.friend_allow_roles))
                                return "friend_allow_roles: array expected";
                            for (let i = 0; i < message.friend_allow_roles.length; ++i)
                                if (!$util.isInteger(message.friend_allow_roles[i]) && !(message.friend_allow_roles[i] && $util.isInteger(message.friend_allow_roles[i].low) && $util.isInteger(message.friend_allow_roles[i].high)))
                                    return "friend_allow_roles: integer|Long[] expected";
                        }
                        return null;
                    };

                    /**
                     * Creates a GuildMemberDmFriendSetting message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting} GuildMemberDmFriendSetting
                     */
                    GuildMemberDmFriendSetting.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting();
                        if (object.dm_switch != null)
                            message.dm_switch = object.dm_switch | 0;
                        if (object.dm_allow_roles) {
                            if (!Array.isArray(object.dm_allow_roles))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.dm_allow_roles: array expected");
                            message.dm_allow_roles = [];
                            for (let i = 0; i < object.dm_allow_roles.length; ++i)
                                if ($util.Long)
                                    (message.dm_allow_roles[i] = $util.Long.fromValue(object.dm_allow_roles[i])).unsigned = false;
                                else if (typeof object.dm_allow_roles[i] === "string")
                                    message.dm_allow_roles[i] = parseInt(object.dm_allow_roles[i], 10);
                                else if (typeof object.dm_allow_roles[i] === "number")
                                    message.dm_allow_roles[i] = object.dm_allow_roles[i];
                                else if (typeof object.dm_allow_roles[i] === "object")
                                    message.dm_allow_roles[i] = new $util.LongBits(object.dm_allow_roles[i].low >>> 0, object.dm_allow_roles[i].high >>> 0).toNumber();
                        }
                        if (object.friend_switch != null)
                            message.friend_switch = object.friend_switch | 0;
                        if (object.friend_allow_roles) {
                            if (!Array.isArray(object.friend_allow_roles))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting.friend_allow_roles: array expected");
                            message.friend_allow_roles = [];
                            for (let i = 0; i < object.friend_allow_roles.length; ++i)
                                if ($util.Long)
                                    (message.friend_allow_roles[i] = $util.Long.fromValue(object.friend_allow_roles[i])).unsigned = false;
                                else if (typeof object.friend_allow_roles[i] === "string")
                                    message.friend_allow_roles[i] = parseInt(object.friend_allow_roles[i], 10);
                                else if (typeof object.friend_allow_roles[i] === "number")
                                    message.friend_allow_roles[i] = object.friend_allow_roles[i];
                                else if (typeof object.friend_allow_roles[i] === "object")
                                    message.friend_allow_roles[i] = new $util.LongBits(object.friend_allow_roles[i].low >>> 0, object.friend_allow_roles[i].high >>> 0).toNumber();
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GuildMemberDmFriendSetting message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting} message GuildMemberDmFriendSetting
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GuildMemberDmFriendSetting.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.dm_allow_roles = [];
                            object.friend_allow_roles = [];
                        }
                        if (options.defaults) {
                            object.dm_switch = 0;
                            object.friend_switch = 0;
                        }
                        if (message.dm_switch != null && message.hasOwnProperty("dm_switch"))
                            object.dm_switch = message.dm_switch;
                        if (message.dm_allow_roles && message.dm_allow_roles.length) {
                            object.dm_allow_roles = [];
                            for (let j = 0; j < message.dm_allow_roles.length; ++j)
                                if (typeof message.dm_allow_roles[j] === "number")
                                    object.dm_allow_roles[j] = options.longs === String ? String(message.dm_allow_roles[j]) : message.dm_allow_roles[j];
                                else
                                    object.dm_allow_roles[j] = options.longs === String ? $util.Long.prototype.toString.call(message.dm_allow_roles[j]) : options.longs === Number ? new $util.LongBits(message.dm_allow_roles[j].low >>> 0, message.dm_allow_roles[j].high >>> 0).toNumber() : message.dm_allow_roles[j];
                        }
                        if (message.friend_switch != null && message.hasOwnProperty("friend_switch"))
                            object.friend_switch = message.friend_switch;
                        if (message.friend_allow_roles && message.friend_allow_roles.length) {
                            object.friend_allow_roles = [];
                            for (let j = 0; j < message.friend_allow_roles.length; ++j)
                                if (typeof message.friend_allow_roles[j] === "number")
                                    object.friend_allow_roles[j] = options.longs === String ? String(message.friend_allow_roles[j]) : message.friend_allow_roles[j];
                                else
                                    object.friend_allow_roles[j] = options.longs === String ? $util.Long.prototype.toString.call(message.friend_allow_roles[j]) : options.longs === Number ? new $util.LongBits(message.friend_allow_roles[j].low >>> 0, message.friend_allow_roles[j].high >>> 0).toNumber() : message.friend_allow_roles[j];
                        }
                        return object;
                    };

                    /**
                     * Converts this GuildMemberDmFriendSetting to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GuildMemberDmFriendSetting.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GuildMemberDmFriendSetting
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GuildMemberDmFriendSetting.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.GuildMemberDmFriendSetting";
                    };

                    return GuildMemberDmFriendSetting;
                })();

                MyGuild.BannerConfig = (function() {

                    /**
                     * Properties of a BannerConfig.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IBannerConfig
                     * @property {string|null} [banner_default] BannerConfig banner_default
                     * @property {string|null} [banner_static] BannerConfig banner_static
                     * @property {number|null} [banner_use] BannerConfig banner_use
                     * @property {string|null} [banner_dynamic] BannerConfig banner_dynamic
                     */

                    /**
                     * Constructs a new BannerConfig.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a BannerConfig.
                     * @implements IBannerConfig
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig=} [properties] Properties to set
                     */
                    function BannerConfig(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * BannerConfig banner_default.
                     * @member {string} banner_default
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @instance
                     */
                    BannerConfig.prototype.banner_default = "";

                    /**
                     * BannerConfig banner_static.
                     * @member {string} banner_static
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @instance
                     */
                    BannerConfig.prototype.banner_static = "";

                    /**
                     * BannerConfig banner_use.
                     * @member {number} banner_use
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @instance
                     */
                    BannerConfig.prototype.banner_use = 0;

                    /**
                     * BannerConfig banner_dynamic.
                     * @member {string} banner_dynamic
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @instance
                     */
                    BannerConfig.prototype.banner_dynamic = "";

                    /**
                     * Creates a new BannerConfig instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BannerConfig} BannerConfig instance
                     */
                    BannerConfig.create = function create(properties) {
                        return new BannerConfig(properties);
                    };

                    /**
                     * Encodes the specified BannerConfig message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.BannerConfig.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig} message BannerConfig message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    BannerConfig.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.banner_default != null && Object.hasOwnProperty.call(message, "banner_default"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.banner_default);
                        if (message.banner_static != null && Object.hasOwnProperty.call(message, "banner_static"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.banner_static);
                        if (message.banner_use != null && Object.hasOwnProperty.call(message, "banner_use"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.banner_use);
                        if (message.banner_dynamic != null && Object.hasOwnProperty.call(message, "banner_dynamic"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.banner_dynamic);
                        return writer;
                    };

                    /**
                     * Encodes the specified BannerConfig message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.BannerConfig.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBannerConfig} message BannerConfig message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    BannerConfig.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a BannerConfig message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BannerConfig} BannerConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    BannerConfig.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.banner_default = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.banner_static = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.banner_use = reader.int32();
                                    break;
                                }
                            case 4: {
                                    message.banner_dynamic = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a BannerConfig message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BannerConfig} BannerConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    BannerConfig.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a BannerConfig message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    BannerConfig.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.banner_default != null && message.hasOwnProperty("banner_default"))
                            if (!$util.isString(message.banner_default))
                                return "banner_default: string expected";
                        if (message.banner_static != null && message.hasOwnProperty("banner_static"))
                            if (!$util.isString(message.banner_static))
                                return "banner_static: string expected";
                        if (message.banner_use != null && message.hasOwnProperty("banner_use"))
                            if (!$util.isInteger(message.banner_use))
                                return "banner_use: integer expected";
                        if (message.banner_dynamic != null && message.hasOwnProperty("banner_dynamic"))
                            if (!$util.isString(message.banner_dynamic))
                                return "banner_dynamic: string expected";
                        return null;
                    };

                    /**
                     * Creates a BannerConfig message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BannerConfig} BannerConfig
                     */
                    BannerConfig.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.BannerConfig();
                        if (object.banner_default != null)
                            message.banner_default = String(object.banner_default);
                        if (object.banner_static != null)
                            message.banner_static = String(object.banner_static);
                        if (object.banner_use != null)
                            message.banner_use = object.banner_use | 0;
                        if (object.banner_dynamic != null)
                            message.banner_dynamic = String(object.banner_dynamic);
                        return message;
                    };

                    /**
                     * Creates a plain object from a BannerConfig message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.BannerConfig} message BannerConfig
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    BannerConfig.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.banner_default = "";
                            object.banner_static = "";
                            object.banner_use = 0;
                            object.banner_dynamic = "";
                        }
                        if (message.banner_default != null && message.hasOwnProperty("banner_default"))
                            object.banner_default = message.banner_default;
                        if (message.banner_static != null && message.hasOwnProperty("banner_static"))
                            object.banner_static = message.banner_static;
                        if (message.banner_use != null && message.hasOwnProperty("banner_use"))
                            object.banner_use = message.banner_use;
                        if (message.banner_dynamic != null && message.hasOwnProperty("banner_dynamic"))
                            object.banner_dynamic = message.banner_dynamic;
                        return object;
                    };

                    /**
                     * Converts this BannerConfig to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    BannerConfig.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for BannerConfig
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BannerConfig
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    BannerConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.BannerConfig";
                    };

                    return BannerConfig;
                })();

                MyGuild.IconDynamic = (function() {

                    /**
                     * Properties of an IconDynamic.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IIconDynamic
                     * @property {string|null} [link_default] IconDynamic link_default
                     * @property {string|null} [link_dynamic] IconDynamic link_dynamic
                     * @property {number|null} [used] IconDynamic used
                     */

                    /**
                     * Constructs a new IconDynamic.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents an IconDynamic.
                     * @implements IIconDynamic
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic=} [properties] Properties to set
                     */
                    function IconDynamic(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * IconDynamic link_default.
                     * @member {string} link_default
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @instance
                     */
                    IconDynamic.prototype.link_default = "";

                    /**
                     * IconDynamic link_dynamic.
                     * @member {string} link_dynamic
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @instance
                     */
                    IconDynamic.prototype.link_dynamic = "";

                    /**
                     * IconDynamic used.
                     * @member {number} used
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @instance
                     */
                    IconDynamic.prototype.used = 0;

                    /**
                     * Creates a new IconDynamic instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.IconDynamic} IconDynamic instance
                     */
                    IconDynamic.create = function create(properties) {
                        return new IconDynamic(properties);
                    };

                    /**
                     * Encodes the specified IconDynamic message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.IconDynamic.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic} message IconDynamic message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    IconDynamic.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.link_default != null && Object.hasOwnProperty.call(message, "link_default"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.link_default);
                        if (message.link_dynamic != null && Object.hasOwnProperty.call(message, "link_dynamic"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.link_dynamic);
                        if (message.used != null && Object.hasOwnProperty.call(message, "used"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.used);
                        return writer;
                    };

                    /**
                     * Encodes the specified IconDynamic message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.IconDynamic.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IIconDynamic} message IconDynamic message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    IconDynamic.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an IconDynamic message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.IconDynamic} IconDynamic
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    IconDynamic.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.link_default = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.link_dynamic = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.used = reader.int32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an IconDynamic message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.IconDynamic} IconDynamic
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    IconDynamic.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an IconDynamic message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    IconDynamic.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.link_default != null && message.hasOwnProperty("link_default"))
                            if (!$util.isString(message.link_default))
                                return "link_default: string expected";
                        if (message.link_dynamic != null && message.hasOwnProperty("link_dynamic"))
                            if (!$util.isString(message.link_dynamic))
                                return "link_dynamic: string expected";
                        if (message.used != null && message.hasOwnProperty("used"))
                            if (!$util.isInteger(message.used))
                                return "used: integer expected";
                        return null;
                    };

                    /**
                     * Creates an IconDynamic message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.IconDynamic} IconDynamic
                     */
                    IconDynamic.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.IconDynamic();
                        if (object.link_default != null)
                            message.link_default = String(object.link_default);
                        if (object.link_dynamic != null)
                            message.link_dynamic = String(object.link_dynamic);
                        if (object.used != null)
                            message.used = object.used | 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from an IconDynamic message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IconDynamic} message IconDynamic
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    IconDynamic.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.link_default = "";
                            object.link_dynamic = "";
                            object.used = 0;
                        }
                        if (message.link_default != null && message.hasOwnProperty("link_default"))
                            object.link_default = message.link_default;
                        if (message.link_dynamic != null && message.hasOwnProperty("link_dynamic"))
                            object.link_dynamic = message.link_dynamic;
                        if (message.used != null && message.hasOwnProperty("used"))
                            object.used = message.used;
                        return object;
                    };

                    /**
                     * Converts this IconDynamic to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    IconDynamic.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for IconDynamic
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.IconDynamic
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    IconDynamic.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.IconDynamic";
                    };

                    return IconDynamic;
                })();

                MyGuild.RelatedApplication = (function() {

                    /**
                     * Properties of a RelatedApplication.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IRelatedApplication
                     * @property {number|null} [app_id] RelatedApplication app_id
                     * @property {string|null} [name] RelatedApplication name
                     * @property {string|null} [button_name] RelatedApplication button_name
                     * @property {string|null} [ios] RelatedApplication ios
                     * @property {string|null} [android] RelatedApplication android
                     * @property {string|null} [img] RelatedApplication img
                     * @property {string|null} [download_link] RelatedApplication download_link
                     */

                    /**
                     * Constructs a new RelatedApplication.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a RelatedApplication.
                     * @implements IRelatedApplication
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication=} [properties] Properties to set
                     */
                    function RelatedApplication(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RelatedApplication app_id.
                     * @member {number} app_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.app_id = 0;

                    /**
                     * RelatedApplication name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.name = "";

                    /**
                     * RelatedApplication button_name.
                     * @member {string} button_name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.button_name = "";

                    /**
                     * RelatedApplication ios.
                     * @member {string} ios
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.ios = "";

                    /**
                     * RelatedApplication android.
                     * @member {string} android
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.android = "";

                    /**
                     * RelatedApplication img.
                     * @member {string} img
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.img = "";

                    /**
                     * RelatedApplication download_link.
                     * @member {string} download_link
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     */
                    RelatedApplication.prototype.download_link = "";

                    /**
                     * Creates a new RelatedApplication instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RelatedApplication} RelatedApplication instance
                     */
                    RelatedApplication.create = function create(properties) {
                        return new RelatedApplication(properties);
                    };

                    /**
                     * Encodes the specified RelatedApplication message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication} message RelatedApplication message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RelatedApplication.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.app_id != null && Object.hasOwnProperty.call(message, "app_id"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.app_id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.button_name != null && Object.hasOwnProperty.call(message, "button_name"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.button_name);
                        if (message.ios != null && Object.hasOwnProperty.call(message, "ios"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.ios);
                        if (message.android != null && Object.hasOwnProperty.call(message, "android"))
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.android);
                        if (message.img != null && Object.hasOwnProperty.call(message, "img"))
                            writer.uint32(/* id 6, wireType 2 =*/50).string(message.img);
                        if (message.download_link != null && Object.hasOwnProperty.call(message, "download_link"))
                            writer.uint32(/* id 7, wireType 2 =*/58).string(message.download_link);
                        return writer;
                    };

                    /**
                     * Encodes the specified RelatedApplication message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RelatedApplication.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRelatedApplication} message RelatedApplication message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RelatedApplication.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RelatedApplication message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RelatedApplication} RelatedApplication
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RelatedApplication.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.app_id = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.button_name = reader.string();
                                    break;
                                }
                            case 4: {
                                    message.ios = reader.string();
                                    break;
                                }
                            case 5: {
                                    message.android = reader.string();
                                    break;
                                }
                            case 6: {
                                    message.img = reader.string();
                                    break;
                                }
                            case 7: {
                                    message.download_link = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RelatedApplication message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RelatedApplication} RelatedApplication
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RelatedApplication.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RelatedApplication message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RelatedApplication.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.app_id != null && message.hasOwnProperty("app_id"))
                            if (!$util.isInteger(message.app_id))
                                return "app_id: integer expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.button_name != null && message.hasOwnProperty("button_name"))
                            if (!$util.isString(message.button_name))
                                return "button_name: string expected";
                        if (message.ios != null && message.hasOwnProperty("ios"))
                            if (!$util.isString(message.ios))
                                return "ios: string expected";
                        if (message.android != null && message.hasOwnProperty("android"))
                            if (!$util.isString(message.android))
                                return "android: string expected";
                        if (message.img != null && message.hasOwnProperty("img"))
                            if (!$util.isString(message.img))
                                return "img: string expected";
                        if (message.download_link != null && message.hasOwnProperty("download_link"))
                            if (!$util.isString(message.download_link))
                                return "download_link: string expected";
                        return null;
                    };

                    /**
                     * Creates a RelatedApplication message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RelatedApplication} RelatedApplication
                     */
                    RelatedApplication.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.RelatedApplication();
                        if (object.app_id != null)
                            message.app_id = object.app_id | 0;
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.button_name != null)
                            message.button_name = String(object.button_name);
                        if (object.ios != null)
                            message.ios = String(object.ios);
                        if (object.android != null)
                            message.android = String(object.android);
                        if (object.img != null)
                            message.img = String(object.img);
                        if (object.download_link != null)
                            message.download_link = String(object.download_link);
                        return message;
                    };

                    /**
                     * Creates a plain object from a RelatedApplication message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.RelatedApplication} message RelatedApplication
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RelatedApplication.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.app_id = 0;
                            object.name = "";
                            object.button_name = "";
                            object.ios = "";
                            object.android = "";
                            object.img = "";
                            object.download_link = "";
                        }
                        if (message.app_id != null && message.hasOwnProperty("app_id"))
                            object.app_id = message.app_id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.button_name != null && message.hasOwnProperty("button_name"))
                            object.button_name = message.button_name;
                        if (message.ios != null && message.hasOwnProperty("ios"))
                            object.ios = message.ios;
                        if (message.android != null && message.hasOwnProperty("android"))
                            object.android = message.android;
                        if (message.img != null && message.hasOwnProperty("img"))
                            object.img = message.img;
                        if (message.download_link != null && message.hasOwnProperty("download_link"))
                            object.download_link = message.download_link;
                        return object;
                    };

                    /**
                     * Converts this RelatedApplication to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RelatedApplication.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RelatedApplication
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RelatedApplication
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RelatedApplication.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.RelatedApplication";
                    };

                    return RelatedApplication;
                })();

                MyGuild.GuildCircle = (function() {

                    /**
                     * Properties of a GuildCircle.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IGuildCircle
                     * @property {string|null} [name] GuildCircle name
                     * @property {string|null} [icon] GuildCircle icon
                     * @property {string|null} [description] GuildCircle description
                     * @property {string|null} [banner] GuildCircle banner
                     * @property {number|null} [channel_id] GuildCircle channel_id
                     * @property {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo|null} [top_channel_info] GuildCircle top_channel_info
                     */

                    /**
                     * Constructs a new GuildCircle.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a GuildCircle.
                     * @implements IGuildCircle
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle=} [properties] Properties to set
                     */
                    function GuildCircle(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GuildCircle name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.name = "";

                    /**
                     * GuildCircle icon.
                     * @member {string} icon
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.icon = "";

                    /**
                     * GuildCircle description.
                     * @member {string} description
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.description = "";

                    /**
                     * GuildCircle banner.
                     * @member {string} banner
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.banner = "";

                    /**
                     * GuildCircle channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * GuildCircle top_channel_info.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo|null|undefined} top_channel_info
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     */
                    GuildCircle.prototype.top_channel_info = null;

                    /**
                     * Creates a new GuildCircle instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildCircle} GuildCircle instance
                     */
                    GuildCircle.create = function create(properties) {
                        return new GuildCircle(properties);
                    };

                    /**
                     * Encodes the specified GuildCircle message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildCircle.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle} message GuildCircle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildCircle.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.icon);
                        if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                        if (message.banner != null && Object.hasOwnProperty.call(message, "banner"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.banner);
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.channel_id);
                        if (message.top_channel_info != null && Object.hasOwnProperty.call(message, "top_channel_info"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.encode(message.top_channel_info, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified GuildCircle message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildCircle.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildCircle} message GuildCircle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildCircle.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GuildCircle message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildCircle} GuildCircle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildCircle.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.icon = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.description = reader.string();
                                    break;
                                }
                            case 4: {
                                    message.banner = reader.string();
                                    break;
                                }
                            case 5: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 6: {
                                    message.top_channel_info = $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GuildCircle message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildCircle} GuildCircle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildCircle.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GuildCircle message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GuildCircle.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            if (!$util.isString(message.icon))
                                return "icon: string expected";
                        if (message.description != null && message.hasOwnProperty("description"))
                            if (!$util.isString(message.description))
                                return "description: string expected";
                        if (message.banner != null && message.hasOwnProperty("banner"))
                            if (!$util.isString(message.banner))
                                return "banner: string expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.top_channel_info != null && message.hasOwnProperty("top_channel_info")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.verify(message.top_channel_info);
                            if (error)
                                return "top_channel_info." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a GuildCircle message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildCircle} GuildCircle
                     */
                    GuildCircle.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildCircle();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.icon != null)
                            message.icon = String(object.icon);
                        if (object.description != null)
                            message.description = String(object.description);
                        if (object.banner != null)
                            message.banner = String(object.banner);
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.top_channel_info != null) {
                            if (typeof object.top_channel_info !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.GuildCircle.top_channel_info: object expected");
                            message.top_channel_info = $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.fromObject(object.top_channel_info);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GuildCircle message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.GuildCircle} message GuildCircle
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GuildCircle.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.name = "";
                            object.icon = "";
                            object.description = "";
                            object.banner = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            object.top_channel_info = null;
                        }
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            object.icon = message.icon;
                        if (message.description != null && message.hasOwnProperty("description"))
                            object.description = message.description;
                        if (message.banner != null && message.hasOwnProperty("banner"))
                            object.banner = message.banner;
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.top_channel_info != null && message.hasOwnProperty("top_channel_info"))
                            object.top_channel_info = $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.toObject(message.top_channel_info, options);
                        return object;
                    };

                    /**
                     * Converts this GuildCircle to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GuildCircle.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GuildCircle
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildCircle
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GuildCircle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.GuildCircle";
                    };

                    return GuildCircle;
                })();

                MyGuild.GuildAnnounce = (function() {

                    /**
                     * Properties of a GuildAnnounce.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IGuildAnnounce
                     * @property {string|null} [name] GuildAnnounce name
                     * @property {number|null} [channel_id] GuildAnnounce channel_id
                     * @property {number|null} [announcement_mode] GuildAnnounce announcement_mode
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu>|null} [announcement_menu] GuildAnnounce announcement_menu
                     */

                    /**
                     * Constructs a new GuildAnnounce.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a GuildAnnounce.
                     * @implements IGuildAnnounce
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce=} [properties] Properties to set
                     */
                    function GuildAnnounce(properties) {
                        this.announcement_menu = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GuildAnnounce name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @instance
                     */
                    GuildAnnounce.prototype.name = "";

                    /**
                     * GuildAnnounce channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @instance
                     */
                    GuildAnnounce.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * GuildAnnounce announcement_mode.
                     * @member {number} announcement_mode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @instance
                     */
                    GuildAnnounce.prototype.announcement_mode = 0;

                    /**
                     * GuildAnnounce announcement_menu.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu>} announcement_menu
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @instance
                     */
                    GuildAnnounce.prototype.announcement_menu = $util.emptyArray;

                    /**
                     * Creates a new GuildAnnounce instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce} GuildAnnounce instance
                     */
                    GuildAnnounce.create = function create(properties) {
                        return new GuildAnnounce(properties);
                    };

                    /**
                     * Encodes the specified GuildAnnounce message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce} message GuildAnnounce message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildAnnounce.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.channel_id);
                        if (message.announcement_mode != null && Object.hasOwnProperty.call(message, "announcement_mode"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.announcement_mode);
                        if (message.announcement_menu != null && message.announcement_menu.length)
                            for (let i = 0; i < message.announcement_menu.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.encode(message.announcement_menu[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified GuildAnnounce message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildAnnounce} message GuildAnnounce message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildAnnounce.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GuildAnnounce message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce} GuildAnnounce
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildAnnounce.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.announcement_mode = reader.int32();
                                    break;
                                }
                            case 4: {
                                    if (!(message.announcement_menu && message.announcement_menu.length))
                                        message.announcement_menu = [];
                                    message.announcement_menu.push($root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GuildAnnounce message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce} GuildAnnounce
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildAnnounce.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GuildAnnounce message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GuildAnnounce.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.announcement_mode != null && message.hasOwnProperty("announcement_mode"))
                            if (!$util.isInteger(message.announcement_mode))
                                return "announcement_mode: integer expected";
                        if (message.announcement_menu != null && message.hasOwnProperty("announcement_menu")) {
                            if (!Array.isArray(message.announcement_menu))
                                return "announcement_menu: array expected";
                            for (let i = 0; i < message.announcement_menu.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.verify(message.announcement_menu[i]);
                                if (error)
                                    return "announcement_menu." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a GuildAnnounce message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce} GuildAnnounce
                     */
                    GuildAnnounce.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.announcement_mode != null)
                            message.announcement_mode = object.announcement_mode | 0;
                        if (object.announcement_menu) {
                            if (!Array.isArray(object.announcement_menu))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.announcement_menu: array expected");
                            message.announcement_menu = [];
                            for (let i = 0; i < object.announcement_menu.length; ++i) {
                                if (typeof object.announcement_menu[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce.announcement_menu: object expected");
                                message.announcement_menu[i] = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.fromObject(object.announcement_menu[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GuildAnnounce message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce} message GuildAnnounce
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GuildAnnounce.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.announcement_menu = [];
                        if (options.defaults) {
                            object.name = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            object.announcement_mode = 0;
                        }
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.announcement_mode != null && message.hasOwnProperty("announcement_mode"))
                            object.announcement_mode = message.announcement_mode;
                        if (message.announcement_menu && message.announcement_menu.length) {
                            object.announcement_menu = [];
                            for (let j = 0; j < message.announcement_menu.length; ++j)
                                object.announcement_menu[j] = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.toObject(message.announcement_menu[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this GuildAnnounce to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GuildAnnounce.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GuildAnnounce
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GuildAnnounce.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.GuildAnnounce";
                    };

                    return GuildAnnounce;
                })();

                MyGuild.TopChannelInfo = (function() {

                    /**
                     * Properties of a TopChannelInfo.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface ITopChannelInfo
                     * @property {number|null} [channel_id] TopChannelInfo channel_id
                     * @property {string|null} [name] TopChannelInfo name
                     * @property {Protocols.Protobuf.PBClass.MyGuild.ITopDefine|null} [top_define] TopChannelInfo top_define
                     */

                    /**
                     * Constructs a new TopChannelInfo.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a TopChannelInfo.
                     * @implements ITopChannelInfo
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo=} [properties] Properties to set
                     */
                    function TopChannelInfo(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * TopChannelInfo channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @instance
                     */
                    TopChannelInfo.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * TopChannelInfo name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @instance
                     */
                    TopChannelInfo.prototype.name = "";

                    /**
                     * TopChannelInfo top_define.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.ITopDefine|null|undefined} top_define
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @instance
                     */
                    TopChannelInfo.prototype.top_define = null;

                    /**
                     * Creates a new TopChannelInfo instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo} TopChannelInfo instance
                     */
                    TopChannelInfo.create = function create(properties) {
                        return new TopChannelInfo(properties);
                    };

                    /**
                     * Encodes the specified TopChannelInfo message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo} message TopChannelInfo message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TopChannelInfo.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.channel_id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.top_define != null && Object.hasOwnProperty.call(message, "top_define"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.encode(message.top_define, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified TopChannelInfo message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopChannelInfo} message TopChannelInfo message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TopChannelInfo.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a TopChannelInfo message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo} TopChannelInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TopChannelInfo.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.decode(reader, reader.uint32());
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a TopChannelInfo message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo} TopChannelInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TopChannelInfo.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a TopChannelInfo message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    TopChannelInfo.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.top_define != null && message.hasOwnProperty("top_define")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.verify(message.top_define);
                            if (error)
                                return "top_define." + error;
                        }
                        return null;
                    };

                    /**
                     * Creates a TopChannelInfo message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo} TopChannelInfo
                     */
                    TopChannelInfo.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo();
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.top_define != null) {
                            if (typeof object.top_define !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo.top_define: object expected");
                            message.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.fromObject(object.top_define);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a TopChannelInfo message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo} message TopChannelInfo
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    TopChannelInfo.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            object.name = "";
                            object.top_define = null;
                        }
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.top_define != null && message.hasOwnProperty("top_define"))
                            object.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.toObject(message.top_define, options);
                        return object;
                    };

                    /**
                     * Converts this TopChannelInfo to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    TopChannelInfo.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for TopChannelInfo
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    TopChannelInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.TopChannelInfo";
                    };

                    return TopChannelInfo;
                })();

                MyGuild.TopDefine = (function() {

                    /**
                     * Properties of a TopDefine.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface ITopDefine
                     * @property {string|null} [status] TopDefine status
                     * @property {string|null} [validTime] TopDefine validTime
                     * @property {string|null} [endTime] TopDefine endTime
                     * @property {Object.<string,string>|null} [command] TopDefine command
                     */

                    /**
                     * Constructs a new TopDefine.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a TopDefine.
                     * @implements ITopDefine
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopDefine=} [properties] Properties to set
                     */
                    function TopDefine(properties) {
                        this.command = {};
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * TopDefine status.
                     * @member {string} status
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @instance
                     */
                    TopDefine.prototype.status = "";

                    /**
                     * TopDefine validTime.
                     * @member {string} validTime
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @instance
                     */
                    TopDefine.prototype.validTime = "";

                    /**
                     * TopDefine endTime.
                     * @member {string} endTime
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @instance
                     */
                    TopDefine.prototype.endTime = "";

                    /**
                     * TopDefine command.
                     * @member {Object.<string,string>} command
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @instance
                     */
                    TopDefine.prototype.command = $util.emptyObject;

                    /**
                     * Creates a new TopDefine instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopDefine=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopDefine} TopDefine instance
                     */
                    TopDefine.create = function create(properties) {
                        return new TopDefine(properties);
                    };

                    /**
                     * Encodes the specified TopDefine message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.TopDefine.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopDefine} message TopDefine message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TopDefine.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.status);
                        if (message.validTime != null && Object.hasOwnProperty.call(message, "validTime"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.validTime);
                        if (message.endTime != null && Object.hasOwnProperty.call(message, "endTime"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.endTime);
                        if (message.command != null && Object.hasOwnProperty.call(message, "command"))
                            for (let keys = Object.keys(message.command), i = 0; i < keys.length; ++i)
                                writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.command[keys[i]]).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified TopDefine message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.TopDefine.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.ITopDefine} message TopDefine message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    TopDefine.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a TopDefine message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopDefine} TopDefine
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TopDefine.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine(), key, value;
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.status = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.validTime = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.endTime = reader.string();
                                    break;
                                }
                            case 4: {
                                    if (message.command === $util.emptyObject)
                                        message.command = {};
                                    let end2 = reader.uint32() + reader.pos;
                                    key = "";
                                    value = "";
                                    while (reader.pos < end2) {
                                        let tag2 = reader.uint32();
                                        switch (tag2 >>> 3) {
                                        case 1:
                                            key = reader.string();
                                            break;
                                        case 2:
                                            value = reader.string();
                                            break;
                                        default:
                                            reader.skipType(tag2 & 7);
                                            break;
                                        }
                                    }
                                    message.command[key] = value;
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a TopDefine message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopDefine} TopDefine
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    TopDefine.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a TopDefine message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    TopDefine.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.status != null && message.hasOwnProperty("status"))
                            if (!$util.isString(message.status))
                                return "status: string expected";
                        if (message.validTime != null && message.hasOwnProperty("validTime"))
                            if (!$util.isString(message.validTime))
                                return "validTime: string expected";
                        if (message.endTime != null && message.hasOwnProperty("endTime"))
                            if (!$util.isString(message.endTime))
                                return "endTime: string expected";
                        if (message.command != null && message.hasOwnProperty("command")) {
                            if (!$util.isObject(message.command))
                                return "command: object expected";
                            let key = Object.keys(message.command);
                            for (let i = 0; i < key.length; ++i)
                                if (!$util.isString(message.command[key[i]]))
                                    return "command: string{k:string} expected";
                        }
                        return null;
                    };

                    /**
                     * Creates a TopDefine message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.TopDefine} TopDefine
                     */
                    TopDefine.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine();
                        if (object.status != null)
                            message.status = String(object.status);
                        if (object.validTime != null)
                            message.validTime = String(object.validTime);
                        if (object.endTime != null)
                            message.endTime = String(object.endTime);
                        if (object.command) {
                            if (typeof object.command !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.TopDefine.command: object expected");
                            message.command = {};
                            for (let keys = Object.keys(object.command), i = 0; i < keys.length; ++i)
                                message.command[keys[i]] = String(object.command[keys[i]]);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a TopDefine message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.TopDefine} message TopDefine
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    TopDefine.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.objects || options.defaults)
                            object.command = {};
                        if (options.defaults) {
                            object.status = "";
                            object.validTime = "";
                            object.endTime = "";
                        }
                        if (message.status != null && message.hasOwnProperty("status"))
                            object.status = message.status;
                        if (message.validTime != null && message.hasOwnProperty("validTime"))
                            object.validTime = message.validTime;
                        if (message.endTime != null && message.hasOwnProperty("endTime"))
                            object.endTime = message.endTime;
                        let keys2;
                        if (message.command && (keys2 = Object.keys(message.command)).length) {
                            object.command = {};
                            for (let j = 0; j < keys2.length; ++j)
                                object.command[keys2[j]] = message.command[keys2[j]];
                        }
                        return object;
                    };

                    /**
                     * Converts this TopDefine to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    TopDefine.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for TopDefine
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.TopDefine
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    TopDefine.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.TopDefine";
                    };

                    return TopDefine;
                })();

                MyGuild.HotCircle = (function() {

                    /**
                     * Properties of a HotCircle.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IHotCircle
                     * @property {number|null} [channel_id] HotCircle channel_id
                     * @property {number|null} [topic_id] HotCircle topic_id
                     * @property {number|null} [user_id] HotCircle user_id
                     * @property {number|null} [guild_id] HotCircle guild_id
                     * @property {number|null} [post_id] HotCircle post_id
                     * @property {string|null} [post_type] HotCircle post_type
                     * @property {number|null} [check_id] HotCircle check_id
                     * @property {number|null} [created_at] HotCircle created_at
                     * @property {number|null} [updated_at] HotCircle updated_at
                     * @property {number|null} [comment_at] HotCircle comment_at
                     * @property {string|null} [content_v2] HotCircle content_v2
                     * @property {number|null} [display] HotCircle display
                     * @property {number|null} [status] HotCircle status
                     * @property {string|null} [geo_region] HotCircle geo_region
                     */

                    /**
                     * Constructs a new HotCircle.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a HotCircle.
                     * @implements IHotCircle
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IHotCircle=} [properties] Properties to set
                     */
                    function HotCircle(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * HotCircle channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle topic_id.
                     * @member {number} topic_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.topic_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle user_id.
                     * @member {number} user_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.user_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle guild_id.
                     * @member {number} guild_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle post_id.
                     * @member {number} post_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.post_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle post_type.
                     * @member {string} post_type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.post_type = "";

                    /**
                     * HotCircle check_id.
                     * @member {number} check_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.check_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle created_at.
                     * @member {number} created_at
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.created_at = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle updated_at.
                     * @member {number} updated_at
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.updated_at = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle comment_at.
                     * @member {number} comment_at
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.comment_at = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * HotCircle content_v2.
                     * @member {string} content_v2
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.content_v2 = "";

                    /**
                     * HotCircle display.
                     * @member {number} display
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.display = 0;

                    /**
                     * HotCircle status.
                     * @member {number} status
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.status = 0;

                    /**
                     * HotCircle geo_region.
                     * @member {string} geo_region
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     */
                    HotCircle.prototype.geo_region = "";

                    /**
                     * Creates a new HotCircle instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IHotCircle=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.HotCircle} HotCircle instance
                     */
                    HotCircle.create = function create(properties) {
                        return new HotCircle(properties);
                    };

                    /**
                     * Encodes the specified HotCircle message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.HotCircle.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IHotCircle} message HotCircle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    HotCircle.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.channel_id);
                        if (message.topic_id != null && Object.hasOwnProperty.call(message, "topic_id"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.topic_id);
                        if (message.user_id != null && Object.hasOwnProperty.call(message, "user_id"))
                            writer.uint32(/* id 3, wireType 1 =*/25).fixed64(message.user_id);
                        if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                            writer.uint32(/* id 4, wireType 1 =*/33).fixed64(message.guild_id);
                        if (message.post_id != null && Object.hasOwnProperty.call(message, "post_id"))
                            writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.post_id);
                        if (message.post_type != null && Object.hasOwnProperty.call(message, "post_type"))
                            writer.uint32(/* id 6, wireType 2 =*/50).string(message.post_type);
                        if (message.check_id != null && Object.hasOwnProperty.call(message, "check_id"))
                            writer.uint32(/* id 7, wireType 1 =*/57).fixed64(message.check_id);
                        if (message.created_at != null && Object.hasOwnProperty.call(message, "created_at"))
                            writer.uint32(/* id 8, wireType 1 =*/65).fixed64(message.created_at);
                        if (message.updated_at != null && Object.hasOwnProperty.call(message, "updated_at"))
                            writer.uint32(/* id 9, wireType 1 =*/73).fixed64(message.updated_at);
                        if (message.comment_at != null && Object.hasOwnProperty.call(message, "comment_at"))
                            writer.uint32(/* id 10, wireType 1 =*/81).fixed64(message.comment_at);
                        if (message.content_v2 != null && Object.hasOwnProperty.call(message, "content_v2"))
                            writer.uint32(/* id 11, wireType 2 =*/90).string(message.content_v2);
                        if (message.display != null && Object.hasOwnProperty.call(message, "display"))
                            writer.uint32(/* id 12, wireType 0 =*/96).int32(message.display);
                        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                            writer.uint32(/* id 13, wireType 0 =*/104).int32(message.status);
                        if (message.geo_region != null && Object.hasOwnProperty.call(message, "geo_region"))
                            writer.uint32(/* id 14, wireType 2 =*/114).string(message.geo_region);
                        return writer;
                    };

                    /**
                     * Encodes the specified HotCircle message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.HotCircle.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IHotCircle} message HotCircle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    HotCircle.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a HotCircle message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.HotCircle} HotCircle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    HotCircle.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.HotCircle();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.topic_id = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.user_id = reader.fixed64();
                                    break;
                                }
                            case 4: {
                                    message.guild_id = reader.fixed64();
                                    break;
                                }
                            case 5: {
                                    message.post_id = reader.fixed64();
                                    break;
                                }
                            case 6: {
                                    message.post_type = reader.string();
                                    break;
                                }
                            case 7: {
                                    message.check_id = reader.fixed64();
                                    break;
                                }
                            case 8: {
                                    message.created_at = reader.fixed64();
                                    break;
                                }
                            case 9: {
                                    message.updated_at = reader.fixed64();
                                    break;
                                }
                            case 10: {
                                    message.comment_at = reader.fixed64();
                                    break;
                                }
                            case 11: {
                                    message.content_v2 = reader.string();
                                    break;
                                }
                            case 12: {
                                    message.display = reader.int32();
                                    break;
                                }
                            case 13: {
                                    message.status = reader.int32();
                                    break;
                                }
                            case 14: {
                                    message.geo_region = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a HotCircle message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.HotCircle} HotCircle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    HotCircle.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a HotCircle message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    HotCircle.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.topic_id != null && message.hasOwnProperty("topic_id"))
                            if (!$util.isInteger(message.topic_id) && !(message.topic_id && $util.isInteger(message.topic_id.low) && $util.isInteger(message.topic_id.high)))
                                return "topic_id: integer|Long expected";
                        if (message.user_id != null && message.hasOwnProperty("user_id"))
                            if (!$util.isInteger(message.user_id) && !(message.user_id && $util.isInteger(message.user_id.low) && $util.isInteger(message.user_id.high)))
                                return "user_id: integer|Long expected";
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                                return "guild_id: integer|Long expected";
                        if (message.post_id != null && message.hasOwnProperty("post_id"))
                            if (!$util.isInteger(message.post_id) && !(message.post_id && $util.isInteger(message.post_id.low) && $util.isInteger(message.post_id.high)))
                                return "post_id: integer|Long expected";
                        if (message.post_type != null && message.hasOwnProperty("post_type"))
                            if (!$util.isString(message.post_type))
                                return "post_type: string expected";
                        if (message.check_id != null && message.hasOwnProperty("check_id"))
                            if (!$util.isInteger(message.check_id) && !(message.check_id && $util.isInteger(message.check_id.low) && $util.isInteger(message.check_id.high)))
                                return "check_id: integer|Long expected";
                        if (message.created_at != null && message.hasOwnProperty("created_at"))
                            if (!$util.isInteger(message.created_at) && !(message.created_at && $util.isInteger(message.created_at.low) && $util.isInteger(message.created_at.high)))
                                return "created_at: integer|Long expected";
                        if (message.updated_at != null && message.hasOwnProperty("updated_at"))
                            if (!$util.isInteger(message.updated_at) && !(message.updated_at && $util.isInteger(message.updated_at.low) && $util.isInteger(message.updated_at.high)))
                                return "updated_at: integer|Long expected";
                        if (message.comment_at != null && message.hasOwnProperty("comment_at"))
                            if (!$util.isInteger(message.comment_at) && !(message.comment_at && $util.isInteger(message.comment_at.low) && $util.isInteger(message.comment_at.high)))
                                return "comment_at: integer|Long expected";
                        if (message.content_v2 != null && message.hasOwnProperty("content_v2"))
                            if (!$util.isString(message.content_v2))
                                return "content_v2: string expected";
                        if (message.display != null && message.hasOwnProperty("display"))
                            if (!$util.isInteger(message.display))
                                return "display: integer expected";
                        if (message.status != null && message.hasOwnProperty("status"))
                            if (!$util.isInteger(message.status))
                                return "status: integer expected";
                        if (message.geo_region != null && message.hasOwnProperty("geo_region"))
                            if (!$util.isString(message.geo_region))
                                return "geo_region: string expected";
                        return null;
                    };

                    /**
                     * Creates a HotCircle message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.HotCircle} HotCircle
                     */
                    HotCircle.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.HotCircle)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.HotCircle();
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.topic_id != null)
                            if ($util.Long)
                                (message.topic_id = $util.Long.fromValue(object.topic_id)).unsigned = false;
                            else if (typeof object.topic_id === "string")
                                message.topic_id = parseInt(object.topic_id, 10);
                            else if (typeof object.topic_id === "number")
                                message.topic_id = object.topic_id;
                            else if (typeof object.topic_id === "object")
                                message.topic_id = new $util.LongBits(object.topic_id.low >>> 0, object.topic_id.high >>> 0).toNumber();
                        if (object.user_id != null)
                            if ($util.Long)
                                (message.user_id = $util.Long.fromValue(object.user_id)).unsigned = false;
                            else if (typeof object.user_id === "string")
                                message.user_id = parseInt(object.user_id, 10);
                            else if (typeof object.user_id === "number")
                                message.user_id = object.user_id;
                            else if (typeof object.user_id === "object")
                                message.user_id = new $util.LongBits(object.user_id.low >>> 0, object.user_id.high >>> 0).toNumber();
                        if (object.guild_id != null)
                            if ($util.Long)
                                (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                            else if (typeof object.guild_id === "string")
                                message.guild_id = parseInt(object.guild_id, 10);
                            else if (typeof object.guild_id === "number")
                                message.guild_id = object.guild_id;
                            else if (typeof object.guild_id === "object")
                                message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                        if (object.post_id != null)
                            if ($util.Long)
                                (message.post_id = $util.Long.fromValue(object.post_id)).unsigned = false;
                            else if (typeof object.post_id === "string")
                                message.post_id = parseInt(object.post_id, 10);
                            else if (typeof object.post_id === "number")
                                message.post_id = object.post_id;
                            else if (typeof object.post_id === "object")
                                message.post_id = new $util.LongBits(object.post_id.low >>> 0, object.post_id.high >>> 0).toNumber();
                        if (object.post_type != null)
                            message.post_type = String(object.post_type);
                        if (object.check_id != null)
                            if ($util.Long)
                                (message.check_id = $util.Long.fromValue(object.check_id)).unsigned = false;
                            else if (typeof object.check_id === "string")
                                message.check_id = parseInt(object.check_id, 10);
                            else if (typeof object.check_id === "number")
                                message.check_id = object.check_id;
                            else if (typeof object.check_id === "object")
                                message.check_id = new $util.LongBits(object.check_id.low >>> 0, object.check_id.high >>> 0).toNumber();
                        if (object.created_at != null)
                            if ($util.Long)
                                (message.created_at = $util.Long.fromValue(object.created_at)).unsigned = false;
                            else if (typeof object.created_at === "string")
                                message.created_at = parseInt(object.created_at, 10);
                            else if (typeof object.created_at === "number")
                                message.created_at = object.created_at;
                            else if (typeof object.created_at === "object")
                                message.created_at = new $util.LongBits(object.created_at.low >>> 0, object.created_at.high >>> 0).toNumber();
                        if (object.updated_at != null)
                            if ($util.Long)
                                (message.updated_at = $util.Long.fromValue(object.updated_at)).unsigned = false;
                            else if (typeof object.updated_at === "string")
                                message.updated_at = parseInt(object.updated_at, 10);
                            else if (typeof object.updated_at === "number")
                                message.updated_at = object.updated_at;
                            else if (typeof object.updated_at === "object")
                                message.updated_at = new $util.LongBits(object.updated_at.low >>> 0, object.updated_at.high >>> 0).toNumber();
                        if (object.comment_at != null)
                            if ($util.Long)
                                (message.comment_at = $util.Long.fromValue(object.comment_at)).unsigned = false;
                            else if (typeof object.comment_at === "string")
                                message.comment_at = parseInt(object.comment_at, 10);
                            else if (typeof object.comment_at === "number")
                                message.comment_at = object.comment_at;
                            else if (typeof object.comment_at === "object")
                                message.comment_at = new $util.LongBits(object.comment_at.low >>> 0, object.comment_at.high >>> 0).toNumber();
                        if (object.content_v2 != null)
                            message.content_v2 = String(object.content_v2);
                        if (object.display != null)
                            message.display = object.display | 0;
                        if (object.status != null)
                            message.status = object.status | 0;
                        if (object.geo_region != null)
                            message.geo_region = String(object.geo_region);
                        return message;
                    };

                    /**
                     * Creates a plain object from a HotCircle message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.HotCircle} message HotCircle
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    HotCircle.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.topic_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.topic_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.user_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.user_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.guild_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.post_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.post_id = options.longs === String ? "0" : 0;
                            object.post_type = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.check_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.check_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.created_at = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.created_at = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.updated_at = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.updated_at = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.comment_at = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.comment_at = options.longs === String ? "0" : 0;
                            object.content_v2 = "";
                            object.display = 0;
                            object.status = 0;
                            object.geo_region = "";
                        }
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.topic_id != null && message.hasOwnProperty("topic_id"))
                            if (typeof message.topic_id === "number")
                                object.topic_id = options.longs === String ? String(message.topic_id) : message.topic_id;
                            else
                                object.topic_id = options.longs === String ? $util.Long.prototype.toString.call(message.topic_id) : options.longs === Number ? new $util.LongBits(message.topic_id.low >>> 0, message.topic_id.high >>> 0).toNumber() : message.topic_id;
                        if (message.user_id != null && message.hasOwnProperty("user_id"))
                            if (typeof message.user_id === "number")
                                object.user_id = options.longs === String ? String(message.user_id) : message.user_id;
                            else
                                object.user_id = options.longs === String ? $util.Long.prototype.toString.call(message.user_id) : options.longs === Number ? new $util.LongBits(message.user_id.low >>> 0, message.user_id.high >>> 0).toNumber() : message.user_id;
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (typeof message.guild_id === "number")
                                object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                            else
                                object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                        if (message.post_id != null && message.hasOwnProperty("post_id"))
                            if (typeof message.post_id === "number")
                                object.post_id = options.longs === String ? String(message.post_id) : message.post_id;
                            else
                                object.post_id = options.longs === String ? $util.Long.prototype.toString.call(message.post_id) : options.longs === Number ? new $util.LongBits(message.post_id.low >>> 0, message.post_id.high >>> 0).toNumber() : message.post_id;
                        if (message.post_type != null && message.hasOwnProperty("post_type"))
                            object.post_type = message.post_type;
                        if (message.check_id != null && message.hasOwnProperty("check_id"))
                            if (typeof message.check_id === "number")
                                object.check_id = options.longs === String ? String(message.check_id) : message.check_id;
                            else
                                object.check_id = options.longs === String ? $util.Long.prototype.toString.call(message.check_id) : options.longs === Number ? new $util.LongBits(message.check_id.low >>> 0, message.check_id.high >>> 0).toNumber() : message.check_id;
                        if (message.created_at != null && message.hasOwnProperty("created_at"))
                            if (typeof message.created_at === "number")
                                object.created_at = options.longs === String ? String(message.created_at) : message.created_at;
                            else
                                object.created_at = options.longs === String ? $util.Long.prototype.toString.call(message.created_at) : options.longs === Number ? new $util.LongBits(message.created_at.low >>> 0, message.created_at.high >>> 0).toNumber() : message.created_at;
                        if (message.updated_at != null && message.hasOwnProperty("updated_at"))
                            if (typeof message.updated_at === "number")
                                object.updated_at = options.longs === String ? String(message.updated_at) : message.updated_at;
                            else
                                object.updated_at = options.longs === String ? $util.Long.prototype.toString.call(message.updated_at) : options.longs === Number ? new $util.LongBits(message.updated_at.low >>> 0, message.updated_at.high >>> 0).toNumber() : message.updated_at;
                        if (message.comment_at != null && message.hasOwnProperty("comment_at"))
                            if (typeof message.comment_at === "number")
                                object.comment_at = options.longs === String ? String(message.comment_at) : message.comment_at;
                            else
                                object.comment_at = options.longs === String ? $util.Long.prototype.toString.call(message.comment_at) : options.longs === Number ? new $util.LongBits(message.comment_at.low >>> 0, message.comment_at.high >>> 0).toNumber() : message.comment_at;
                        if (message.content_v2 != null && message.hasOwnProperty("content_v2"))
                            object.content_v2 = message.content_v2;
                        if (message.display != null && message.hasOwnProperty("display"))
                            object.display = message.display;
                        if (message.status != null && message.hasOwnProperty("status"))
                            object.status = message.status;
                        if (message.geo_region != null && message.hasOwnProperty("geo_region"))
                            object.geo_region = message.geo_region;
                        return object;
                    };

                    /**
                     * Converts this HotCircle to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    HotCircle.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for HotCircle
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.HotCircle
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    HotCircle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.HotCircle";
                    };

                    return HotCircle;
                })();

                MyGuild.GuildTag = (function() {

                    /**
                     * Properties of a GuildTag.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IGuildTag
                     * @property {number|null} [id] GuildTag id
                     * @property {string|null} [name] GuildTag name
                     * @property {number|null} [level] GuildTag level
                     * @property {number|null} [item_num] GuildTag item_num
                     * @property {string|null} [item] GuildTag item
                     */

                    /**
                     * Constructs a new GuildTag.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a GuildTag.
                     * @implements IGuildTag
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildTag=} [properties] Properties to set
                     */
                    function GuildTag(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GuildTag id.
                     * @member {number} id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     */
                    GuildTag.prototype.id = 0;

                    /**
                     * GuildTag name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     */
                    GuildTag.prototype.name = "";

                    /**
                     * GuildTag level.
                     * @member {number} level
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     */
                    GuildTag.prototype.level = 0;

                    /**
                     * GuildTag item_num.
                     * @member {number} item_num
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     */
                    GuildTag.prototype.item_num = 0;

                    /**
                     * GuildTag item.
                     * @member {string} item
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     */
                    GuildTag.prototype.item = "";

                    /**
                     * Creates a new GuildTag instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildTag=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildTag} GuildTag instance
                     */
                    GuildTag.create = function create(properties) {
                        return new GuildTag(properties);
                    };

                    /**
                     * Encodes the specified GuildTag message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildTag.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildTag} message GuildTag message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildTag.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.level);
                        if (message.item_num != null && Object.hasOwnProperty.call(message, "item_num"))
                            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.item_num);
                        if (message.item != null && Object.hasOwnProperty.call(message, "item"))
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.item);
                        return writer;
                    };

                    /**
                     * Encodes the specified GuildTag message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.GuildTag.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IGuildTag} message GuildTag message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GuildTag.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GuildTag message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildTag} GuildTag
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildTag.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.id = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.level = reader.int32();
                                    break;
                                }
                            case 4: {
                                    message.item_num = reader.int32();
                                    break;
                                }
                            case 5: {
                                    message.item = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GuildTag message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildTag} GuildTag
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GuildTag.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GuildTag message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GuildTag.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.id != null && message.hasOwnProperty("id"))
                            if (!$util.isInteger(message.id))
                                return "id: integer expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.level != null && message.hasOwnProperty("level"))
                            if (!$util.isInteger(message.level))
                                return "level: integer expected";
                        if (message.item_num != null && message.hasOwnProperty("item_num"))
                            if (!$util.isInteger(message.item_num))
                                return "item_num: integer expected";
                        if (message.item != null && message.hasOwnProperty("item"))
                            if (!$util.isString(message.item))
                                return "item: string expected";
                        return null;
                    };

                    /**
                     * Creates a GuildTag message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.GuildTag} GuildTag
                     */
                    GuildTag.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.GuildTag();
                        if (object.id != null)
                            message.id = object.id | 0;
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.level != null)
                            message.level = object.level | 0;
                        if (object.item_num != null)
                            message.item_num = object.item_num | 0;
                        if (object.item != null)
                            message.item = String(object.item);
                        return message;
                    };

                    /**
                     * Creates a plain object from a GuildTag message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.GuildTag} message GuildTag
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GuildTag.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.id = 0;
                            object.name = "";
                            object.level = 0;
                            object.item_num = 0;
                            object.item = "";
                        }
                        if (message.id != null && message.hasOwnProperty("id"))
                            object.id = message.id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.level != null && message.hasOwnProperty("level"))
                            object.level = message.level;
                        if (message.item_num != null && message.hasOwnProperty("item_num"))
                            object.item_num = message.item_num;
                        if (message.item != null && message.hasOwnProperty("item"))
                            object.item = message.item;
                        return object;
                    };

                    /**
                     * Converts this GuildTag to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GuildTag.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GuildTag
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.GuildTag
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GuildTag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.GuildTag";
                    };

                    return GuildTag;
                })();

                MyGuild.Channel = (function() {

                    /**
                     * Properties of a Channel.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IChannel
                     * @property {number|null} [channel_id] Channel channel_id
                     * @property {number|null} [guild_id] Channel guild_id
                     * @property {string|null} [name] Channel name
                     * @property {string|null} [topic] Channel topic
                     * @property {number|null} [type] Channel type
                     * @property {boolean|null} [pending_user_access] Channel pending_user_access
                     * @property {string|null} [description] Channel description
                     * @property {number|null} [is_private] Channel is_private
                     * @property {number|null} [slow_mode] Channel slow_mode
                     * @property {number|null} [announcement_mode] Channel announcement_mode
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu>|null} [announcement_menu] Channel announcement_menu
                     * @property {Protocols.Protobuf.PBClass.MyGuild.ITopDefine|null} [top_define] Channel top_define
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IBotSettingList>|null} [bot_setting_list] Channel bot_setting_list
                     * @property {number|null} [live_active] Channel live_active
                     * @property {Array.<Protocols.Protobuf.PBClass.MyGuild.IOverwrite>|null} [overwrite] Channel overwrite
                     * @property {number|null} [topic_flag] Channel topic_flag
                     * @property {number|null} [owner_id] Channel owner_id
                     * @property {number|null} [voice_owner] Channel voice_owner
                     * @property {number|null} [active] Channel active
                     * @property {number|null} [parent_id] Channel parent_id
                     * @property {number|null} [updated_at] Channel updated_at
                     * @property {number|null} [voice_control] Channel voice_control
                     * @property {number|null} [quality] Channel quality
                     * @property {string|null} [link] Channel link
                     * @property {number|null} [user_limit] Channel user_limit
                     * @property {number|null} [share_model] Channel share_model
                     * @property {number|null} [last_message_id] Channel last_message_id
                     */

                    /**
                     * Constructs a new Channel.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a Channel.
                     * @implements IChannel
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IChannel=} [properties] Properties to set
                     */
                    function Channel(properties) {
                        this.announcement_menu = [];
                        this.bot_setting_list = [];
                        this.overwrite = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Channel channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Channel guild_id.
                     * @member {number} guild_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Channel name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.name = "";

                    /**
                     * Channel topic.
                     * @member {string} topic
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.topic = "";

                    /**
                     * Channel type.
                     * @member {number} type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.type = 0;

                    /**
                     * Channel pending_user_access.
                     * @member {boolean} pending_user_access
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.pending_user_access = false;

                    /**
                     * Channel description.
                     * @member {string} description
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.description = "";

                    /**
                     * Channel is_private.
                     * @member {number} is_private
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.is_private = 0;

                    /**
                     * Channel slow_mode.
                     * @member {number} slow_mode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.slow_mode = 0;

                    /**
                     * Channel announcement_mode.
                     * @member {number} announcement_mode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.announcement_mode = 0;

                    /**
                     * Channel announcement_menu.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu>} announcement_menu
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.announcement_menu = $util.emptyArray;

                    /**
                     * Channel top_define.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.ITopDefine|null|undefined} top_define
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.top_define = null;

                    /**
                     * Channel bot_setting_list.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IBotSettingList>} bot_setting_list
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.bot_setting_list = $util.emptyArray;

                    /**
                     * Channel live_active.
                     * @member {number} live_active
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.live_active = 0;

                    /**
                     * Channel overwrite.
                     * @member {Array.<Protocols.Protobuf.PBClass.MyGuild.IOverwrite>} overwrite
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.overwrite = $util.emptyArray;

                    /**
                     * Channel topic_flag.
                     * @member {number} topic_flag
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.topic_flag = 0;

                    /**
                     * Channel owner_id.
                     * @member {number} owner_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.owner_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Channel voice_owner.
                     * @member {number} voice_owner
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.voice_owner = 0;

                    /**
                     * Channel active.
                     * @member {number} active
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.active = 0;

                    /**
                     * Channel parent_id.
                     * @member {number} parent_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.parent_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Channel updated_at.
                     * @member {number} updated_at
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.updated_at = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Channel voice_control.
                     * @member {number} voice_control
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.voice_control = 0;

                    /**
                     * Channel quality.
                     * @member {number} quality
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.quality = 0;

                    /**
                     * Channel link.
                     * @member {string} link
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.link = "";

                    /**
                     * Channel user_limit.
                     * @member {number} user_limit
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.user_limit = 0;

                    /**
                     * Channel share_model.
                     * @member {number} share_model
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.share_model = 0;

                    /**
                     * Channel last_message_id.
                     * @member {number} last_message_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     */
                    Channel.prototype.last_message_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Creates a new Channel instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IChannel=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Channel} Channel instance
                     */
                    Channel.create = function create(properties) {
                        return new Channel(properties);
                    };

                    /**
                     * Encodes the specified Channel message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Channel.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IChannel} message Channel message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Channel.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.channel_id);
                        if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.guild_id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                        if (message.topic != null && Object.hasOwnProperty.call(message, "topic"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.topic);
                        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.type);
                        if (message.pending_user_access != null && Object.hasOwnProperty.call(message, "pending_user_access"))
                            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.pending_user_access);
                        if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                            writer.uint32(/* id 7, wireType 2 =*/58).string(message.description);
                        if (message.is_private != null && Object.hasOwnProperty.call(message, "is_private"))
                            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.is_private);
                        if (message.slow_mode != null && Object.hasOwnProperty.call(message, "slow_mode"))
                            writer.uint32(/* id 9, wireType 0 =*/72).int32(message.slow_mode);
                        if (message.announcement_mode != null && Object.hasOwnProperty.call(message, "announcement_mode"))
                            writer.uint32(/* id 10, wireType 0 =*/80).int32(message.announcement_mode);
                        if (message.announcement_menu != null && message.announcement_menu.length)
                            for (let i = 0; i < message.announcement_menu.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.encode(message.announcement_menu[i], writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                        if (message.top_define != null && Object.hasOwnProperty.call(message, "top_define"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.encode(message.top_define, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                        if (message.bot_setting_list != null && message.bot_setting_list.length)
                            for (let i = 0; i < message.bot_setting_list.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList.encode(message.bot_setting_list[i], writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
                        if (message.live_active != null && Object.hasOwnProperty.call(message, "live_active"))
                            writer.uint32(/* id 14, wireType 0 =*/112).int32(message.live_active);
                        if (message.overwrite != null && message.overwrite.length)
                            for (let i = 0; i < message.overwrite.length; ++i)
                                $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite.encode(message.overwrite[i], writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
                        if (message.topic_flag != null && Object.hasOwnProperty.call(message, "topic_flag"))
                            writer.uint32(/* id 16, wireType 0 =*/128).int32(message.topic_flag);
                        if (message.owner_id != null && Object.hasOwnProperty.call(message, "owner_id"))
                            writer.uint32(/* id 17, wireType 1 =*/137).fixed64(message.owner_id);
                        if (message.voice_owner != null && Object.hasOwnProperty.call(message, "voice_owner"))
                            writer.uint32(/* id 18, wireType 0 =*/144).int32(message.voice_owner);
                        if (message.active != null && Object.hasOwnProperty.call(message, "active"))
                            writer.uint32(/* id 19, wireType 0 =*/152).int32(message.active);
                        if (message.parent_id != null && Object.hasOwnProperty.call(message, "parent_id"))
                            writer.uint32(/* id 20, wireType 1 =*/161).fixed64(message.parent_id);
                        if (message.updated_at != null && Object.hasOwnProperty.call(message, "updated_at"))
                            writer.uint32(/* id 21, wireType 1 =*/169).fixed64(message.updated_at);
                        if (message.voice_control != null && Object.hasOwnProperty.call(message, "voice_control"))
                            writer.uint32(/* id 22, wireType 0 =*/176).int32(message.voice_control);
                        if (message.quality != null && Object.hasOwnProperty.call(message, "quality"))
                            writer.uint32(/* id 23, wireType 0 =*/184).int32(message.quality);
                        if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                            writer.uint32(/* id 24, wireType 2 =*/194).string(message.link);
                        if (message.user_limit != null && Object.hasOwnProperty.call(message, "user_limit"))
                            writer.uint32(/* id 25, wireType 0 =*/200).int32(message.user_limit);
                        if (message.share_model != null && Object.hasOwnProperty.call(message, "share_model"))
                            writer.uint32(/* id 26, wireType 0 =*/208).int32(message.share_model);
                        if (message.last_message_id != null && Object.hasOwnProperty.call(message, "last_message_id"))
                            writer.uint32(/* id 27, wireType 1 =*/217).fixed64(message.last_message_id);
                        return writer;
                    };

                    /**
                     * Encodes the specified Channel message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Channel.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IChannel} message Channel message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Channel.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Channel message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Channel} Channel
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Channel.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.Channel();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.guild_id = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 4: {
                                    message.topic = reader.string();
                                    break;
                                }
                            case 5: {
                                    message.type = reader.int32();
                                    break;
                                }
                            case 6: {
                                    message.pending_user_access = reader.bool();
                                    break;
                                }
                            case 7: {
                                    message.description = reader.string();
                                    break;
                                }
                            case 8: {
                                    message.is_private = reader.int32();
                                    break;
                                }
                            case 9: {
                                    message.slow_mode = reader.int32();
                                    break;
                                }
                            case 10: {
                                    message.announcement_mode = reader.int32();
                                    break;
                                }
                            case 11: {
                                    if (!(message.announcement_menu && message.announcement_menu.length))
                                        message.announcement_menu = [];
                                    message.announcement_menu.push($root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 12: {
                                    message.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.decode(reader, reader.uint32());
                                    break;
                                }
                            case 13: {
                                    if (!(message.bot_setting_list && message.bot_setting_list.length))
                                        message.bot_setting_list = [];
                                    message.bot_setting_list.push($root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 14: {
                                    message.live_active = reader.int32();
                                    break;
                                }
                            case 15: {
                                    if (!(message.overwrite && message.overwrite.length))
                                        message.overwrite = [];
                                    message.overwrite.push($root.Protocols.Protobuf.PBClass.MyGuild.Overwrite.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 16: {
                                    message.topic_flag = reader.int32();
                                    break;
                                }
                            case 17: {
                                    message.owner_id = reader.fixed64();
                                    break;
                                }
                            case 18: {
                                    message.voice_owner = reader.int32();
                                    break;
                                }
                            case 19: {
                                    message.active = reader.int32();
                                    break;
                                }
                            case 20: {
                                    message.parent_id = reader.fixed64();
                                    break;
                                }
                            case 21: {
                                    message.updated_at = reader.fixed64();
                                    break;
                                }
                            case 22: {
                                    message.voice_control = reader.int32();
                                    break;
                                }
                            case 23: {
                                    message.quality = reader.int32();
                                    break;
                                }
                            case 24: {
                                    message.link = reader.string();
                                    break;
                                }
                            case 25: {
                                    message.user_limit = reader.int32();
                                    break;
                                }
                            case 26: {
                                    message.share_model = reader.int32();
                                    break;
                                }
                            case 27: {
                                    message.last_message_id = reader.fixed64();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Channel message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Channel} Channel
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Channel.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Channel message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Channel.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                                return "guild_id: integer|Long expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.topic != null && message.hasOwnProperty("topic"))
                            if (!$util.isString(message.topic))
                                return "topic: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            if (!$util.isInteger(message.type))
                                return "type: integer expected";
                        if (message.pending_user_access != null && message.hasOwnProperty("pending_user_access"))
                            if (typeof message.pending_user_access !== "boolean")
                                return "pending_user_access: boolean expected";
                        if (message.description != null && message.hasOwnProperty("description"))
                            if (!$util.isString(message.description))
                                return "description: string expected";
                        if (message.is_private != null && message.hasOwnProperty("is_private"))
                            if (!$util.isInteger(message.is_private))
                                return "is_private: integer expected";
                        if (message.slow_mode != null && message.hasOwnProperty("slow_mode"))
                            if (!$util.isInteger(message.slow_mode))
                                return "slow_mode: integer expected";
                        if (message.announcement_mode != null && message.hasOwnProperty("announcement_mode"))
                            if (!$util.isInteger(message.announcement_mode))
                                return "announcement_mode: integer expected";
                        if (message.announcement_menu != null && message.hasOwnProperty("announcement_menu")) {
                            if (!Array.isArray(message.announcement_menu))
                                return "announcement_menu: array expected";
                            for (let i = 0; i < message.announcement_menu.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.verify(message.announcement_menu[i]);
                                if (error)
                                    return "announcement_menu." + error;
                            }
                        }
                        if (message.top_define != null && message.hasOwnProperty("top_define")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.verify(message.top_define);
                            if (error)
                                return "top_define." + error;
                        }
                        if (message.bot_setting_list != null && message.hasOwnProperty("bot_setting_list")) {
                            if (!Array.isArray(message.bot_setting_list))
                                return "bot_setting_list: array expected";
                            for (let i = 0; i < message.bot_setting_list.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList.verify(message.bot_setting_list[i]);
                                if (error)
                                    return "bot_setting_list." + error;
                            }
                        }
                        if (message.live_active != null && message.hasOwnProperty("live_active"))
                            if (!$util.isInteger(message.live_active))
                                return "live_active: integer expected";
                        if (message.overwrite != null && message.hasOwnProperty("overwrite")) {
                            if (!Array.isArray(message.overwrite))
                                return "overwrite: array expected";
                            for (let i = 0; i < message.overwrite.length; ++i) {
                                let error = $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite.verify(message.overwrite[i]);
                                if (error)
                                    return "overwrite." + error;
                            }
                        }
                        if (message.topic_flag != null && message.hasOwnProperty("topic_flag"))
                            if (!$util.isInteger(message.topic_flag))
                                return "topic_flag: integer expected";
                        if (message.owner_id != null && message.hasOwnProperty("owner_id"))
                            if (!$util.isInteger(message.owner_id) && !(message.owner_id && $util.isInteger(message.owner_id.low) && $util.isInteger(message.owner_id.high)))
                                return "owner_id: integer|Long expected";
                        if (message.voice_owner != null && message.hasOwnProperty("voice_owner"))
                            if (!$util.isInteger(message.voice_owner))
                                return "voice_owner: integer expected";
                        if (message.active != null && message.hasOwnProperty("active"))
                            if (!$util.isInteger(message.active))
                                return "active: integer expected";
                        if (message.parent_id != null && message.hasOwnProperty("parent_id"))
                            if (!$util.isInteger(message.parent_id) && !(message.parent_id && $util.isInteger(message.parent_id.low) && $util.isInteger(message.parent_id.high)))
                                return "parent_id: integer|Long expected";
                        if (message.updated_at != null && message.hasOwnProperty("updated_at"))
                            if (!$util.isInteger(message.updated_at) && !(message.updated_at && $util.isInteger(message.updated_at.low) && $util.isInteger(message.updated_at.high)))
                                return "updated_at: integer|Long expected";
                        if (message.voice_control != null && message.hasOwnProperty("voice_control"))
                            if (!$util.isInteger(message.voice_control))
                                return "voice_control: integer expected";
                        if (message.quality != null && message.hasOwnProperty("quality"))
                            if (!$util.isInteger(message.quality))
                                return "quality: integer expected";
                        if (message.link != null && message.hasOwnProperty("link"))
                            if (!$util.isString(message.link))
                                return "link: string expected";
                        if (message.user_limit != null && message.hasOwnProperty("user_limit"))
                            if (!$util.isInteger(message.user_limit))
                                return "user_limit: integer expected";
                        if (message.share_model != null && message.hasOwnProperty("share_model"))
                            if (!$util.isInteger(message.share_model))
                                return "share_model: integer expected";
                        if (message.last_message_id != null && message.hasOwnProperty("last_message_id"))
                            if (!$util.isInteger(message.last_message_id) && !(message.last_message_id && $util.isInteger(message.last_message_id.low) && $util.isInteger(message.last_message_id.high)))
                                return "last_message_id: integer|Long expected";
                        return null;
                    };

                    /**
                     * Creates a Channel message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Channel} Channel
                     */
                    Channel.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.Channel)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.Channel();
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.guild_id != null)
                            if ($util.Long)
                                (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                            else if (typeof object.guild_id === "string")
                                message.guild_id = parseInt(object.guild_id, 10);
                            else if (typeof object.guild_id === "number")
                                message.guild_id = object.guild_id;
                            else if (typeof object.guild_id === "object")
                                message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.topic != null)
                            message.topic = String(object.topic);
                        if (object.type != null)
                            message.type = object.type | 0;
                        if (object.pending_user_access != null)
                            message.pending_user_access = Boolean(object.pending_user_access);
                        if (object.description != null)
                            message.description = String(object.description);
                        if (object.is_private != null)
                            message.is_private = object.is_private | 0;
                        if (object.slow_mode != null)
                            message.slow_mode = object.slow_mode | 0;
                        if (object.announcement_mode != null)
                            message.announcement_mode = object.announcement_mode | 0;
                        if (object.announcement_menu) {
                            if (!Array.isArray(object.announcement_menu))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.announcement_menu: array expected");
                            message.announcement_menu = [];
                            for (let i = 0; i < object.announcement_menu.length; ++i) {
                                if (typeof object.announcement_menu[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.announcement_menu: object expected");
                                message.announcement_menu[i] = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.fromObject(object.announcement_menu[i]);
                            }
                        }
                        if (object.top_define != null) {
                            if (typeof object.top_define !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.top_define: object expected");
                            message.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.fromObject(object.top_define);
                        }
                        if (object.bot_setting_list) {
                            if (!Array.isArray(object.bot_setting_list))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.bot_setting_list: array expected");
                            message.bot_setting_list = [];
                            for (let i = 0; i < object.bot_setting_list.length; ++i) {
                                if (typeof object.bot_setting_list[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.bot_setting_list: object expected");
                                message.bot_setting_list[i] = $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList.fromObject(object.bot_setting_list[i]);
                            }
                        }
                        if (object.live_active != null)
                            message.live_active = object.live_active | 0;
                        if (object.overwrite) {
                            if (!Array.isArray(object.overwrite))
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.overwrite: array expected");
                            message.overwrite = [];
                            for (let i = 0; i < object.overwrite.length; ++i) {
                                if (typeof object.overwrite[i] !== "object")
                                    throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Channel.overwrite: object expected");
                                message.overwrite[i] = $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite.fromObject(object.overwrite[i]);
                            }
                        }
                        if (object.topic_flag != null)
                            message.topic_flag = object.topic_flag | 0;
                        if (object.owner_id != null)
                            if ($util.Long)
                                (message.owner_id = $util.Long.fromValue(object.owner_id)).unsigned = false;
                            else if (typeof object.owner_id === "string")
                                message.owner_id = parseInt(object.owner_id, 10);
                            else if (typeof object.owner_id === "number")
                                message.owner_id = object.owner_id;
                            else if (typeof object.owner_id === "object")
                                message.owner_id = new $util.LongBits(object.owner_id.low >>> 0, object.owner_id.high >>> 0).toNumber();
                        if (object.voice_owner != null)
                            message.voice_owner = object.voice_owner | 0;
                        if (object.active != null)
                            message.active = object.active | 0;
                        if (object.parent_id != null)
                            if ($util.Long)
                                (message.parent_id = $util.Long.fromValue(object.parent_id)).unsigned = false;
                            else if (typeof object.parent_id === "string")
                                message.parent_id = parseInt(object.parent_id, 10);
                            else if (typeof object.parent_id === "number")
                                message.parent_id = object.parent_id;
                            else if (typeof object.parent_id === "object")
                                message.parent_id = new $util.LongBits(object.parent_id.low >>> 0, object.parent_id.high >>> 0).toNumber();
                        if (object.updated_at != null)
                            if ($util.Long)
                                (message.updated_at = $util.Long.fromValue(object.updated_at)).unsigned = false;
                            else if (typeof object.updated_at === "string")
                                message.updated_at = parseInt(object.updated_at, 10);
                            else if (typeof object.updated_at === "number")
                                message.updated_at = object.updated_at;
                            else if (typeof object.updated_at === "object")
                                message.updated_at = new $util.LongBits(object.updated_at.low >>> 0, object.updated_at.high >>> 0).toNumber();
                        if (object.voice_control != null)
                            message.voice_control = object.voice_control | 0;
                        if (object.quality != null)
                            message.quality = object.quality | 0;
                        if (object.link != null)
                            message.link = String(object.link);
                        if (object.user_limit != null)
                            message.user_limit = object.user_limit | 0;
                        if (object.share_model != null)
                            message.share_model = object.share_model | 0;
                        if (object.last_message_id != null)
                            if ($util.Long)
                                (message.last_message_id = $util.Long.fromValue(object.last_message_id)).unsigned = false;
                            else if (typeof object.last_message_id === "string")
                                message.last_message_id = parseInt(object.last_message_id, 10);
                            else if (typeof object.last_message_id === "number")
                                message.last_message_id = object.last_message_id;
                            else if (typeof object.last_message_id === "object")
                                message.last_message_id = new $util.LongBits(object.last_message_id.low >>> 0, object.last_message_id.high >>> 0).toNumber();
                        return message;
                    };

                    /**
                     * Creates a plain object from a Channel message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.Channel} message Channel
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Channel.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults) {
                            object.announcement_menu = [];
                            object.bot_setting_list = [];
                            object.overwrite = [];
                        }
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.guild_id = options.longs === String ? "0" : 0;
                            object.name = "";
                            object.topic = "";
                            object.type = 0;
                            object.pending_user_access = false;
                            object.description = "";
                            object.is_private = 0;
                            object.slow_mode = 0;
                            object.announcement_mode = 0;
                            object.top_define = null;
                            object.live_active = 0;
                            object.topic_flag = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.owner_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.owner_id = options.longs === String ? "0" : 0;
                            object.voice_owner = 0;
                            object.active = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.parent_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.parent_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.updated_at = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.updated_at = options.longs === String ? "0" : 0;
                            object.voice_control = 0;
                            object.quality = 0;
                            object.link = "";
                            object.user_limit = 0;
                            object.share_model = 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.last_message_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.last_message_id = options.longs === String ? "0" : 0;
                        }
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (typeof message.guild_id === "number")
                                object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                            else
                                object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.topic != null && message.hasOwnProperty("topic"))
                            object.topic = message.topic;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = message.type;
                        if (message.pending_user_access != null && message.hasOwnProperty("pending_user_access"))
                            object.pending_user_access = message.pending_user_access;
                        if (message.description != null && message.hasOwnProperty("description"))
                            object.description = message.description;
                        if (message.is_private != null && message.hasOwnProperty("is_private"))
                            object.is_private = message.is_private;
                        if (message.slow_mode != null && message.hasOwnProperty("slow_mode"))
                            object.slow_mode = message.slow_mode;
                        if (message.announcement_mode != null && message.hasOwnProperty("announcement_mode"))
                            object.announcement_mode = message.announcement_mode;
                        if (message.announcement_menu && message.announcement_menu.length) {
                            object.announcement_menu = [];
                            for (let j = 0; j < message.announcement_menu.length; ++j)
                                object.announcement_menu[j] = $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.toObject(message.announcement_menu[j], options);
                        }
                        if (message.top_define != null && message.hasOwnProperty("top_define"))
                            object.top_define = $root.Protocols.Protobuf.PBClass.MyGuild.TopDefine.toObject(message.top_define, options);
                        if (message.bot_setting_list && message.bot_setting_list.length) {
                            object.bot_setting_list = [];
                            for (let j = 0; j < message.bot_setting_list.length; ++j)
                                object.bot_setting_list[j] = $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList.toObject(message.bot_setting_list[j], options);
                        }
                        if (message.live_active != null && message.hasOwnProperty("live_active"))
                            object.live_active = message.live_active;
                        if (message.overwrite && message.overwrite.length) {
                            object.overwrite = [];
                            for (let j = 0; j < message.overwrite.length; ++j)
                                object.overwrite[j] = $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite.toObject(message.overwrite[j], options);
                        }
                        if (message.topic_flag != null && message.hasOwnProperty("topic_flag"))
                            object.topic_flag = message.topic_flag;
                        if (message.owner_id != null && message.hasOwnProperty("owner_id"))
                            if (typeof message.owner_id === "number")
                                object.owner_id = options.longs === String ? String(message.owner_id) : message.owner_id;
                            else
                                object.owner_id = options.longs === String ? $util.Long.prototype.toString.call(message.owner_id) : options.longs === Number ? new $util.LongBits(message.owner_id.low >>> 0, message.owner_id.high >>> 0).toNumber() : message.owner_id;
                        if (message.voice_owner != null && message.hasOwnProperty("voice_owner"))
                            object.voice_owner = message.voice_owner;
                        if (message.active != null && message.hasOwnProperty("active"))
                            object.active = message.active;
                        if (message.parent_id != null && message.hasOwnProperty("parent_id"))
                            if (typeof message.parent_id === "number")
                                object.parent_id = options.longs === String ? String(message.parent_id) : message.parent_id;
                            else
                                object.parent_id = options.longs === String ? $util.Long.prototype.toString.call(message.parent_id) : options.longs === Number ? new $util.LongBits(message.parent_id.low >>> 0, message.parent_id.high >>> 0).toNumber() : message.parent_id;
                        if (message.updated_at != null && message.hasOwnProperty("updated_at"))
                            if (typeof message.updated_at === "number")
                                object.updated_at = options.longs === String ? String(message.updated_at) : message.updated_at;
                            else
                                object.updated_at = options.longs === String ? $util.Long.prototype.toString.call(message.updated_at) : options.longs === Number ? new $util.LongBits(message.updated_at.low >>> 0, message.updated_at.high >>> 0).toNumber() : message.updated_at;
                        if (message.voice_control != null && message.hasOwnProperty("voice_control"))
                            object.voice_control = message.voice_control;
                        if (message.quality != null && message.hasOwnProperty("quality"))
                            object.quality = message.quality;
                        if (message.link != null && message.hasOwnProperty("link"))
                            object.link = message.link;
                        if (message.user_limit != null && message.hasOwnProperty("user_limit"))
                            object.user_limit = message.user_limit;
                        if (message.share_model != null && message.hasOwnProperty("share_model"))
                            object.share_model = message.share_model;
                        if (message.last_message_id != null && message.hasOwnProperty("last_message_id"))
                            if (typeof message.last_message_id === "number")
                                object.last_message_id = options.longs === String ? String(message.last_message_id) : message.last_message_id;
                            else
                                object.last_message_id = options.longs === String ? $util.Long.prototype.toString.call(message.last_message_id) : options.longs === Number ? new $util.LongBits(message.last_message_id.low >>> 0, message.last_message_id.high >>> 0).toNumber() : message.last_message_id;
                        return object;
                    };

                    /**
                     * Converts this Channel to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Channel.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Channel
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Channel
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Channel.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.Channel";
                    };

                    return Channel;
                })();

                MyGuild.AnnouncementMenu = (function() {

                    /**
                     * Properties of an AnnouncementMenu.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IAnnouncementMenu
                     * @property {string|null} [link] AnnouncementMenu link
                     * @property {string|null} [name] AnnouncementMenu name
                     * @property {string|null} [type] AnnouncementMenu type
                     */

                    /**
                     * Constructs a new AnnouncementMenu.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents an AnnouncementMenu.
                     * @implements IAnnouncementMenu
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu=} [properties] Properties to set
                     */
                    function AnnouncementMenu(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * AnnouncementMenu link.
                     * @member {string} link
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @instance
                     */
                    AnnouncementMenu.prototype.link = "";

                    /**
                     * AnnouncementMenu name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @instance
                     */
                    AnnouncementMenu.prototype.name = "";

                    /**
                     * AnnouncementMenu type.
                     * @member {string} type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @instance
                     */
                    AnnouncementMenu.prototype.type = "";

                    /**
                     * Creates a new AnnouncementMenu instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu} AnnouncementMenu instance
                     */
                    AnnouncementMenu.create = function create(properties) {
                        return new AnnouncementMenu(properties);
                    };

                    /**
                     * Encodes the specified AnnouncementMenu message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu} message AnnouncementMenu message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AnnouncementMenu.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.link);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
                        return writer;
                    };

                    /**
                     * Encodes the specified AnnouncementMenu message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IAnnouncementMenu} message AnnouncementMenu message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    AnnouncementMenu.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an AnnouncementMenu message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu} AnnouncementMenu
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AnnouncementMenu.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.link = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 3: {
                                    message.type = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an AnnouncementMenu message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu} AnnouncementMenu
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    AnnouncementMenu.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an AnnouncementMenu message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    AnnouncementMenu.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.link != null && message.hasOwnProperty("link"))
                            if (!$util.isString(message.link))
                                return "link: string expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            if (!$util.isString(message.type))
                                return "type: string expected";
                        return null;
                    };

                    /**
                     * Creates an AnnouncementMenu message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu} AnnouncementMenu
                     */
                    AnnouncementMenu.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu();
                        if (object.link != null)
                            message.link = String(object.link);
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.type != null)
                            message.type = String(object.type);
                        return message;
                    };

                    /**
                     * Creates a plain object from an AnnouncementMenu message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu} message AnnouncementMenu
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    AnnouncementMenu.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.link = "";
                            object.name = "";
                            object.type = "";
                        }
                        if (message.link != null && message.hasOwnProperty("link"))
                            object.link = message.link;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = message.type;
                        return object;
                    };

                    /**
                     * Converts this AnnouncementMenu to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    AnnouncementMenu.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for AnnouncementMenu
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    AnnouncementMenu.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.AnnouncementMenu";
                    };

                    return AnnouncementMenu;
                })();

                MyGuild.BotSettingList = (function() {

                    /**
                     * Properties of a BotSettingList.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IBotSettingList
                     * @property {Object.<string,string>|null} [bot_setting_list] BotSettingList bot_setting_list
                     */

                    /**
                     * Constructs a new BotSettingList.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a BotSettingList.
                     * @implements IBotSettingList
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBotSettingList=} [properties] Properties to set
                     */
                    function BotSettingList(properties) {
                        this.bot_setting_list = {};
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * BotSettingList bot_setting_list.
                     * @member {Object.<string,string>} bot_setting_list
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @instance
                     */
                    BotSettingList.prototype.bot_setting_list = $util.emptyObject;

                    /**
                     * Creates a new BotSettingList instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBotSettingList=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BotSettingList} BotSettingList instance
                     */
                    BotSettingList.create = function create(properties) {
                        return new BotSettingList(properties);
                    };

                    /**
                     * Encodes the specified BotSettingList message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.BotSettingList.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBotSettingList} message BotSettingList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    BotSettingList.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.bot_setting_list != null && Object.hasOwnProperty.call(message, "bot_setting_list"))
                            for (let keys = Object.keys(message.bot_setting_list), i = 0; i < keys.length; ++i)
                                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.bot_setting_list[keys[i]]).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified BotSettingList message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.BotSettingList.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IBotSettingList} message BotSettingList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    BotSettingList.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a BotSettingList message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BotSettingList} BotSettingList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    BotSettingList.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList(), key, value;
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    if (message.bot_setting_list === $util.emptyObject)
                                        message.bot_setting_list = {};
                                    let end2 = reader.uint32() + reader.pos;
                                    key = "";
                                    value = "";
                                    while (reader.pos < end2) {
                                        let tag2 = reader.uint32();
                                        switch (tag2 >>> 3) {
                                        case 1:
                                            key = reader.string();
                                            break;
                                        case 2:
                                            value = reader.string();
                                            break;
                                        default:
                                            reader.skipType(tag2 & 7);
                                            break;
                                        }
                                    }
                                    message.bot_setting_list[key] = value;
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a BotSettingList message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BotSettingList} BotSettingList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    BotSettingList.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a BotSettingList message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    BotSettingList.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.bot_setting_list != null && message.hasOwnProperty("bot_setting_list")) {
                            if (!$util.isObject(message.bot_setting_list))
                                return "bot_setting_list: object expected";
                            let key = Object.keys(message.bot_setting_list);
                            for (let i = 0; i < key.length; ++i)
                                if (!$util.isString(message.bot_setting_list[key[i]]))
                                    return "bot_setting_list: string{k:string} expected";
                        }
                        return null;
                    };

                    /**
                     * Creates a BotSettingList message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.BotSettingList} BotSettingList
                     */
                    BotSettingList.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.BotSettingList();
                        if (object.bot_setting_list) {
                            if (typeof object.bot_setting_list !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.BotSettingList.bot_setting_list: object expected");
                            message.bot_setting_list = {};
                            for (let keys = Object.keys(object.bot_setting_list), i = 0; i < keys.length; ++i)
                                message.bot_setting_list[keys[i]] = String(object.bot_setting_list[keys[i]]);
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a BotSettingList message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.BotSettingList} message BotSettingList
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    BotSettingList.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.objects || options.defaults)
                            object.bot_setting_list = {};
                        let keys2;
                        if (message.bot_setting_list && (keys2 = Object.keys(message.bot_setting_list)).length) {
                            object.bot_setting_list = {};
                            for (let j = 0; j < keys2.length; ++j)
                                object.bot_setting_list[keys2[j]] = message.bot_setting_list[keys2[j]];
                        }
                        return object;
                    };

                    /**
                     * Converts this BotSettingList to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    BotSettingList.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for BotSettingList
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.BotSettingList
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    BotSettingList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.BotSettingList";
                    };

                    return BotSettingList;
                })();

                MyGuild.Role = (function() {

                    /**
                     * Properties of a Role.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IRole
                     * @property {number|null} [role_id] Role role_id
                     * @property {number|null} [permissions] Role permissions
                     * @property {string|null} [name] Role name
                     * @property {number|null} [color] Role color
                     * @property {number|null} [position] Role position
                     * @property {boolean|null} [hoist] Role hoist
                     * @property {boolean|null} [managed] Role managed
                     * @property {Protocols.Protobuf.PBClass.MyGuild.IRoleTag|null} [tag] Role tag
                     * @property {number|null} [t] Role t
                     * @property {string|null} [icon] Role icon
                     * @property {number|null} [group_id] Role group_id
                     * @property {number|null} [sort] Role sort
                     */

                    /**
                     * Constructs a new Role.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a Role.
                     * @implements IRole
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRole=} [properties] Properties to set
                     */
                    function Role(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Role role_id.
                     * @member {number} role_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.role_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Role permissions.
                     * @member {number} permissions
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.permissions = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Role name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.name = "";

                    /**
                     * Role color.
                     * @member {number} color
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.color = 0;

                    /**
                     * Role position.
                     * @member {number} position
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.position = 0;

                    /**
                     * Role hoist.
                     * @member {boolean} hoist
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.hoist = false;

                    /**
                     * Role managed.
                     * @member {boolean} managed
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.managed = false;

                    /**
                     * Role tag.
                     * @member {Protocols.Protobuf.PBClass.MyGuild.IRoleTag|null|undefined} tag
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.tag = null;

                    /**
                     * Role t.
                     * @member {number} t
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.t = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Role icon.
                     * @member {string} icon
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.icon = "";

                    /**
                     * Role group_id.
                     * @member {number} group_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.group_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Role sort.
                     * @member {number} sort
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     */
                    Role.prototype.sort = 0;

                    /**
                     * Creates a new Role instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRole=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Role} Role instance
                     */
                    Role.create = function create(properties) {
                        return new Role(properties);
                    };

                    /**
                     * Encodes the specified Role message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Role.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRole} message Role message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Role.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.role_id != null && Object.hasOwnProperty.call(message, "role_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.role_id);
                        if (message.permissions != null && Object.hasOwnProperty.call(message, "permissions"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.permissions);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
                        if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.color);
                        if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.position);
                        if (message.hoist != null && Object.hasOwnProperty.call(message, "hoist"))
                            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.hoist);
                        if (message.managed != null && Object.hasOwnProperty.call(message, "managed"))
                            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.managed);
                        if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                            $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag.encode(message.tag, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                        if (message.t != null && Object.hasOwnProperty.call(message, "t"))
                            writer.uint32(/* id 9, wireType 1 =*/73).fixed64(message.t);
                        if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
                            writer.uint32(/* id 10, wireType 2 =*/82).string(message.icon);
                        if (message.group_id != null && Object.hasOwnProperty.call(message, "group_id"))
                            writer.uint32(/* id 11, wireType 1 =*/89).fixed64(message.group_id);
                        if (message.sort != null && Object.hasOwnProperty.call(message, "sort"))
                            writer.uint32(/* id 12, wireType 0 =*/96).int32(message.sort);
                        return writer;
                    };

                    /**
                     * Encodes the specified Role message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Role.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRole} message Role message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Role.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Role message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Role} Role
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Role.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.Role();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.role_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.permissions = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 4: {
                                    message.color = reader.int32();
                                    break;
                                }
                            case 5: {
                                    message.position = reader.int32();
                                    break;
                                }
                            case 6: {
                                    message.hoist = reader.bool();
                                    break;
                                }
                            case 7: {
                                    message.managed = reader.bool();
                                    break;
                                }
                            case 8: {
                                    message.tag = $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag.decode(reader, reader.uint32());
                                    break;
                                }
                            case 9: {
                                    message.t = reader.fixed64();
                                    break;
                                }
                            case 10: {
                                    message.icon = reader.string();
                                    break;
                                }
                            case 11: {
                                    message.group_id = reader.fixed64();
                                    break;
                                }
                            case 12: {
                                    message.sort = reader.int32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Role message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Role} Role
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Role.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Role message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Role.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.role_id != null && message.hasOwnProperty("role_id"))
                            if (!$util.isInteger(message.role_id) && !(message.role_id && $util.isInteger(message.role_id.low) && $util.isInteger(message.role_id.high)))
                                return "role_id: integer|Long expected";
                        if (message.permissions != null && message.hasOwnProperty("permissions"))
                            if (!$util.isInteger(message.permissions) && !(message.permissions && $util.isInteger(message.permissions.low) && $util.isInteger(message.permissions.high)))
                                return "permissions: integer|Long expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.color != null && message.hasOwnProperty("color"))
                            if (!$util.isInteger(message.color))
                                return "color: integer expected";
                        if (message.position != null && message.hasOwnProperty("position"))
                            if (!$util.isInteger(message.position))
                                return "position: integer expected";
                        if (message.hoist != null && message.hasOwnProperty("hoist"))
                            if (typeof message.hoist !== "boolean")
                                return "hoist: boolean expected";
                        if (message.managed != null && message.hasOwnProperty("managed"))
                            if (typeof message.managed !== "boolean")
                                return "managed: boolean expected";
                        if (message.tag != null && message.hasOwnProperty("tag")) {
                            let error = $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag.verify(message.tag);
                            if (error)
                                return "tag." + error;
                        }
                        if (message.t != null && message.hasOwnProperty("t"))
                            if (!$util.isInteger(message.t) && !(message.t && $util.isInteger(message.t.low) && $util.isInteger(message.t.high)))
                                return "t: integer|Long expected";
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            if (!$util.isString(message.icon))
                                return "icon: string expected";
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (!$util.isInteger(message.group_id) && !(message.group_id && $util.isInteger(message.group_id.low) && $util.isInteger(message.group_id.high)))
                                return "group_id: integer|Long expected";
                        if (message.sort != null && message.hasOwnProperty("sort"))
                            if (!$util.isInteger(message.sort))
                                return "sort: integer expected";
                        return null;
                    };

                    /**
                     * Creates a Role message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Role} Role
                     */
                    Role.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.Role)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.Role();
                        if (object.role_id != null)
                            if ($util.Long)
                                (message.role_id = $util.Long.fromValue(object.role_id)).unsigned = false;
                            else if (typeof object.role_id === "string")
                                message.role_id = parseInt(object.role_id, 10);
                            else if (typeof object.role_id === "number")
                                message.role_id = object.role_id;
                            else if (typeof object.role_id === "object")
                                message.role_id = new $util.LongBits(object.role_id.low >>> 0, object.role_id.high >>> 0).toNumber();
                        if (object.permissions != null)
                            if ($util.Long)
                                (message.permissions = $util.Long.fromValue(object.permissions)).unsigned = false;
                            else if (typeof object.permissions === "string")
                                message.permissions = parseInt(object.permissions, 10);
                            else if (typeof object.permissions === "number")
                                message.permissions = object.permissions;
                            else if (typeof object.permissions === "object")
                                message.permissions = new $util.LongBits(object.permissions.low >>> 0, object.permissions.high >>> 0).toNumber();
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.color != null)
                            message.color = object.color | 0;
                        if (object.position != null)
                            message.position = object.position | 0;
                        if (object.hoist != null)
                            message.hoist = Boolean(object.hoist);
                        if (object.managed != null)
                            message.managed = Boolean(object.managed);
                        if (object.tag != null) {
                            if (typeof object.tag !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.MyGuild.Role.tag: object expected");
                            message.tag = $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag.fromObject(object.tag);
                        }
                        if (object.t != null)
                            if ($util.Long)
                                (message.t = $util.Long.fromValue(object.t)).unsigned = false;
                            else if (typeof object.t === "string")
                                message.t = parseInt(object.t, 10);
                            else if (typeof object.t === "number")
                                message.t = object.t;
                            else if (typeof object.t === "object")
                                message.t = new $util.LongBits(object.t.low >>> 0, object.t.high >>> 0).toNumber();
                        if (object.icon != null)
                            message.icon = String(object.icon);
                        if (object.group_id != null)
                            if ($util.Long)
                                (message.group_id = $util.Long.fromValue(object.group_id)).unsigned = false;
                            else if (typeof object.group_id === "string")
                                message.group_id = parseInt(object.group_id, 10);
                            else if (typeof object.group_id === "number")
                                message.group_id = object.group_id;
                            else if (typeof object.group_id === "object")
                                message.group_id = new $util.LongBits(object.group_id.low >>> 0, object.group_id.high >>> 0).toNumber();
                        if (object.sort != null)
                            message.sort = object.sort | 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from a Role message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.Role} message Role
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Role.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.role_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.role_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.permissions = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.permissions = options.longs === String ? "0" : 0;
                            object.name = "";
                            object.color = 0;
                            object.position = 0;
                            object.hoist = false;
                            object.managed = false;
                            object.tag = null;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.t = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.t = options.longs === String ? "0" : 0;
                            object.icon = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.group_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.group_id = options.longs === String ? "0" : 0;
                            object.sort = 0;
                        }
                        if (message.role_id != null && message.hasOwnProperty("role_id"))
                            if (typeof message.role_id === "number")
                                object.role_id = options.longs === String ? String(message.role_id) : message.role_id;
                            else
                                object.role_id = options.longs === String ? $util.Long.prototype.toString.call(message.role_id) : options.longs === Number ? new $util.LongBits(message.role_id.low >>> 0, message.role_id.high >>> 0).toNumber() : message.role_id;
                        if (message.permissions != null && message.hasOwnProperty("permissions"))
                            if (typeof message.permissions === "number")
                                object.permissions = options.longs === String ? String(message.permissions) : message.permissions;
                            else
                                object.permissions = options.longs === String ? $util.Long.prototype.toString.call(message.permissions) : options.longs === Number ? new $util.LongBits(message.permissions.low >>> 0, message.permissions.high >>> 0).toNumber() : message.permissions;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.color != null && message.hasOwnProperty("color"))
                            object.color = message.color;
                        if (message.position != null && message.hasOwnProperty("position"))
                            object.position = message.position;
                        if (message.hoist != null && message.hasOwnProperty("hoist"))
                            object.hoist = message.hoist;
                        if (message.managed != null && message.hasOwnProperty("managed"))
                            object.managed = message.managed;
                        if (message.tag != null && message.hasOwnProperty("tag"))
                            object.tag = $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag.toObject(message.tag, options);
                        if (message.t != null && message.hasOwnProperty("t"))
                            if (typeof message.t === "number")
                                object.t = options.longs === String ? String(message.t) : message.t;
                            else
                                object.t = options.longs === String ? $util.Long.prototype.toString.call(message.t) : options.longs === Number ? new $util.LongBits(message.t.low >>> 0, message.t.high >>> 0).toNumber() : message.t;
                        if (message.icon != null && message.hasOwnProperty("icon"))
                            object.icon = message.icon;
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (typeof message.group_id === "number")
                                object.group_id = options.longs === String ? String(message.group_id) : message.group_id;
                            else
                                object.group_id = options.longs === String ? $util.Long.prototype.toString.call(message.group_id) : options.longs === Number ? new $util.LongBits(message.group_id.low >>> 0, message.group_id.high >>> 0).toNumber() : message.group_id;
                        if (message.sort != null && message.hasOwnProperty("sort"))
                            object.sort = message.sort;
                        return object;
                    };

                    /**
                     * Converts this Role to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Role.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Role
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Role
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Role.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.Role";
                    };

                    return Role;
                })();

                MyGuild.Overwrite = (function() {

                    /**
                     * Properties of an Overwrite.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IOverwrite
                     * @property {string|null} [action_type] Overwrite action_type
                     * @property {number|null} [allows] Overwrite allows
                     * @property {number|null} [deny] Overwrite deny
                     * @property {number|null} [id] Overwrite id
                     * @property {number|null} [channel_id] Overwrite channel_id
                     * @property {number|null} [guild_id] Overwrite guild_id
                     * @property {string|null} [name] Overwrite name
                     */

                    /**
                     * Constructs a new Overwrite.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents an Overwrite.
                     * @implements IOverwrite
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IOverwrite=} [properties] Properties to set
                     */
                    function Overwrite(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Overwrite action_type.
                     * @member {string} action_type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.action_type = "";

                    /**
                     * Overwrite allows.
                     * @member {number} allows
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.allows = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Overwrite deny.
                     * @member {number} deny
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.deny = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Overwrite id.
                     * @member {number} id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Overwrite channel_id.
                     * @member {number} channel_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Overwrite guild_id.
                     * @member {number} guild_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Overwrite name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     */
                    Overwrite.prototype.name = "";

                    /**
                     * Creates a new Overwrite instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IOverwrite=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Overwrite} Overwrite instance
                     */
                    Overwrite.create = function create(properties) {
                        return new Overwrite(properties);
                    };

                    /**
                     * Encodes the specified Overwrite message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Overwrite.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IOverwrite} message Overwrite message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Overwrite.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.action_type != null && Object.hasOwnProperty.call(message, "action_type"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.action_type);
                        if (message.allows != null && Object.hasOwnProperty.call(message, "allows"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.allows);
                        if (message.deny != null && Object.hasOwnProperty.call(message, "deny"))
                            writer.uint32(/* id 3, wireType 1 =*/25).fixed64(message.deny);
                        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                            writer.uint32(/* id 4, wireType 1 =*/33).fixed64(message.id);
                        if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                            writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.channel_id);
                        if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                            writer.uint32(/* id 6, wireType 1 =*/49).fixed64(message.guild_id);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 7, wireType 2 =*/58).string(message.name);
                        return writer;
                    };

                    /**
                     * Encodes the specified Overwrite message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.Overwrite.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IOverwrite} message Overwrite message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Overwrite.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Overwrite message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Overwrite} Overwrite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Overwrite.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.action_type = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.allows = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.deny = reader.fixed64();
                                    break;
                                }
                            case 4: {
                                    message.id = reader.fixed64();
                                    break;
                                }
                            case 5: {
                                    message.channel_id = reader.fixed64();
                                    break;
                                }
                            case 6: {
                                    message.guild_id = reader.fixed64();
                                    break;
                                }
                            case 7: {
                                    message.name = reader.string();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Overwrite message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Overwrite} Overwrite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Overwrite.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Overwrite message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Overwrite.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.action_type != null && message.hasOwnProperty("action_type"))
                            if (!$util.isString(message.action_type))
                                return "action_type: string expected";
                        if (message.allows != null && message.hasOwnProperty("allows"))
                            if (!$util.isInteger(message.allows) && !(message.allows && $util.isInteger(message.allows.low) && $util.isInteger(message.allows.high)))
                                return "allows: integer|Long expected";
                        if (message.deny != null && message.hasOwnProperty("deny"))
                            if (!$util.isInteger(message.deny) && !(message.deny && $util.isInteger(message.deny.low) && $util.isInteger(message.deny.high)))
                                return "deny: integer|Long expected";
                        if (message.id != null && message.hasOwnProperty("id"))
                            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                                return "id: integer|Long expected";
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                                return "channel_id: integer|Long expected";
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                                return "guild_id: integer|Long expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        return null;
                    };

                    /**
                     * Creates an Overwrite message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.Overwrite} Overwrite
                     */
                    Overwrite.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.Overwrite();
                        if (object.action_type != null)
                            message.action_type = String(object.action_type);
                        if (object.allows != null)
                            if ($util.Long)
                                (message.allows = $util.Long.fromValue(object.allows)).unsigned = false;
                            else if (typeof object.allows === "string")
                                message.allows = parseInt(object.allows, 10);
                            else if (typeof object.allows === "number")
                                message.allows = object.allows;
                            else if (typeof object.allows === "object")
                                message.allows = new $util.LongBits(object.allows.low >>> 0, object.allows.high >>> 0).toNumber();
                        if (object.deny != null)
                            if ($util.Long)
                                (message.deny = $util.Long.fromValue(object.deny)).unsigned = false;
                            else if (typeof object.deny === "string")
                                message.deny = parseInt(object.deny, 10);
                            else if (typeof object.deny === "number")
                                message.deny = object.deny;
                            else if (typeof object.deny === "object")
                                message.deny = new $util.LongBits(object.deny.low >>> 0, object.deny.high >>> 0).toNumber();
                        if (object.id != null)
                            if ($util.Long)
                                (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                            else if (typeof object.id === "string")
                                message.id = parseInt(object.id, 10);
                            else if (typeof object.id === "number")
                                message.id = object.id;
                            else if (typeof object.id === "object")
                                message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
                        if (object.channel_id != null)
                            if ($util.Long)
                                (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                            else if (typeof object.channel_id === "string")
                                message.channel_id = parseInt(object.channel_id, 10);
                            else if (typeof object.channel_id === "number")
                                message.channel_id = object.channel_id;
                            else if (typeof object.channel_id === "object")
                                message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                        if (object.guild_id != null)
                            if ($util.Long)
                                (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                            else if (typeof object.guild_id === "string")
                                message.guild_id = parseInt(object.guild_id, 10);
                            else if (typeof object.guild_id === "number")
                                message.guild_id = object.guild_id;
                            else if (typeof object.guild_id === "object")
                                message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                        if (object.name != null)
                            message.name = String(object.name);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Overwrite message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.Overwrite} message Overwrite
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Overwrite.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.action_type = "";
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.allows = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.allows = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.deny = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.deny = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.channel_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.guild_id = options.longs === String ? "0" : 0;
                            object.name = "";
                        }
                        if (message.action_type != null && message.hasOwnProperty("action_type"))
                            object.action_type = message.action_type;
                        if (message.allows != null && message.hasOwnProperty("allows"))
                            if (typeof message.allows === "number")
                                object.allows = options.longs === String ? String(message.allows) : message.allows;
                            else
                                object.allows = options.longs === String ? $util.Long.prototype.toString.call(message.allows) : options.longs === Number ? new $util.LongBits(message.allows.low >>> 0, message.allows.high >>> 0).toNumber() : message.allows;
                        if (message.deny != null && message.hasOwnProperty("deny"))
                            if (typeof message.deny === "number")
                                object.deny = options.longs === String ? String(message.deny) : message.deny;
                            else
                                object.deny = options.longs === String ? $util.Long.prototype.toString.call(message.deny) : options.longs === Number ? new $util.LongBits(message.deny.low >>> 0, message.deny.high >>> 0).toNumber() : message.deny;
                        if (message.id != null && message.hasOwnProperty("id"))
                            if (typeof message.id === "number")
                                object.id = options.longs === String ? String(message.id) : message.id;
                            else
                                object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
                        if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                            if (typeof message.channel_id === "number")
                                object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                            else
                                object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (typeof message.guild_id === "number")
                                object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                            else
                                object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        return object;
                    };

                    /**
                     * Converts this Overwrite to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Overwrite.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Overwrite
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.Overwrite
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Overwrite.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.Overwrite";
                    };

                    return Overwrite;
                })();

                MyGuild.RoleTag = (function() {

                    /**
                     * Properties of a RoleTag.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IRoleTag
                     * @property {number|null} [bot_id] RoleTag bot_id
                     */

                    /**
                     * Constructs a new RoleTag.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a RoleTag.
                     * @implements IRoleTag
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleTag=} [properties] Properties to set
                     */
                    function RoleTag(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RoleTag bot_id.
                     * @member {number} bot_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @instance
                     */
                    RoleTag.prototype.bot_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * Creates a new RoleTag instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleTag=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleTag} RoleTag instance
                     */
                    RoleTag.create = function create(properties) {
                        return new RoleTag(properties);
                    };

                    /**
                     * Encodes the specified RoleTag message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RoleTag.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleTag} message RoleTag message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RoleTag.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.bot_id != null && Object.hasOwnProperty.call(message, "bot_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.bot_id);
                        return writer;
                    };

                    /**
                     * Encodes the specified RoleTag message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RoleTag.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleTag} message RoleTag message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RoleTag.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RoleTag message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleTag} RoleTag
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RoleTag.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.bot_id = reader.fixed64();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RoleTag message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleTag} RoleTag
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RoleTag.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RoleTag message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RoleTag.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.bot_id != null && message.hasOwnProperty("bot_id"))
                            if (!$util.isInteger(message.bot_id) && !(message.bot_id && $util.isInteger(message.bot_id.low) && $util.isInteger(message.bot_id.high)))
                                return "bot_id: integer|Long expected";
                        return null;
                    };

                    /**
                     * Creates a RoleTag message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleTag} RoleTag
                     */
                    RoleTag.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.RoleTag();
                        if (object.bot_id != null)
                            if ($util.Long)
                                (message.bot_id = $util.Long.fromValue(object.bot_id)).unsigned = false;
                            else if (typeof object.bot_id === "string")
                                message.bot_id = parseInt(object.bot_id, 10);
                            else if (typeof object.bot_id === "number")
                                message.bot_id = object.bot_id;
                            else if (typeof object.bot_id === "object")
                                message.bot_id = new $util.LongBits(object.bot_id.low >>> 0, object.bot_id.high >>> 0).toNumber();
                        return message;
                    };

                    /**
                     * Creates a plain object from a RoleTag message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.RoleTag} message RoleTag
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RoleTag.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults)
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.bot_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.bot_id = options.longs === String ? "0" : 0;
                        if (message.bot_id != null && message.hasOwnProperty("bot_id"))
                            if (typeof message.bot_id === "number")
                                object.bot_id = options.longs === String ? String(message.bot_id) : message.bot_id;
                            else
                                object.bot_id = options.longs === String ? $util.Long.prototype.toString.call(message.bot_id) : options.longs === Number ? new $util.LongBits(message.bot_id.low >>> 0, message.bot_id.high >>> 0).toNumber() : message.bot_id;
                        return object;
                    };

                    /**
                     * Converts this RoleTag to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RoleTag.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RoleTag
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleTag
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RoleTag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.RoleTag";
                    };

                    return RoleTag;
                })();

                MyGuild.RoleGroup = (function() {

                    /**
                     * Properties of a RoleGroup.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @interface IRoleGroup
                     * @property {number|null} [group_id] RoleGroup group_id
                     * @property {number|null} [guild_id] RoleGroup guild_id
                     * @property {number|null} [sort] RoleGroup sort
                     * @property {string|null} [name] RoleGroup name
                     * @property {number|null} [type] RoleGroup type
                     */

                    /**
                     * Constructs a new RoleGroup.
                     * @memberof Protocols.Protobuf.PBClass.MyGuild
                     * @classdesc Represents a RoleGroup.
                     * @implements IRoleGroup
                     * @constructor
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleGroup=} [properties] Properties to set
                     */
                    function RoleGroup(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RoleGroup group_id.
                     * @member {number} group_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     */
                    RoleGroup.prototype.group_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * RoleGroup guild_id.
                     * @member {number} guild_id
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     */
                    RoleGroup.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                    /**
                     * RoleGroup sort.
                     * @member {number} sort
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     */
                    RoleGroup.prototype.sort = 0;

                    /**
                     * RoleGroup name.
                     * @member {string} name
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     */
                    RoleGroup.prototype.name = "";

                    /**
                     * RoleGroup type.
                     * @member {number} type
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     */
                    RoleGroup.prototype.type = 0;

                    /**
                     * Creates a new RoleGroup instance using the specified properties.
                     * @function create
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleGroup=} [properties] Properties to set
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleGroup} RoleGroup instance
                     */
                    RoleGroup.create = function create(properties) {
                        return new RoleGroup(properties);
                    };

                    /**
                     * Encodes the specified RoleGroup message. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RoleGroup.verify|verify} messages.
                     * @function encode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleGroup} message RoleGroup message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RoleGroup.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.group_id != null && Object.hasOwnProperty.call(message, "group_id"))
                            writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.group_id);
                        if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                            writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.guild_id);
                        if (message.sort != null && Object.hasOwnProperty.call(message, "sort"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sort);
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 4, wireType 2 =*/34).string(message.name);
                        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.type);
                        return writer;
                    };

                    /**
                     * Encodes the specified RoleGroup message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MyGuild.RoleGroup.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.IRoleGroup} message RoleGroup message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RoleGroup.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a RoleGroup message from the specified reader or buffer.
                     * @function decode
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleGroup} RoleGroup
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RoleGroup.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.group_id = reader.fixed64();
                                    break;
                                }
                            case 2: {
                                    message.guild_id = reader.fixed64();
                                    break;
                                }
                            case 3: {
                                    message.sort = reader.int32();
                                    break;
                                }
                            case 4: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 5: {
                                    message.type = reader.int32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a RoleGroup message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleGroup} RoleGroup
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    RoleGroup.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RoleGroup message.
                     * @function verify
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RoleGroup.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (!$util.isInteger(message.group_id) && !(message.group_id && $util.isInteger(message.group_id.low) && $util.isInteger(message.group_id.high)))
                                return "group_id: integer|Long expected";
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                                return "guild_id: integer|Long expected";
                        if (message.sort != null && message.hasOwnProperty("sort"))
                            if (!$util.isInteger(message.sort))
                                return "sort: integer expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            if (!$util.isInteger(message.type))
                                return "type: integer expected";
                        return null;
                    };

                    /**
                     * Creates a RoleGroup message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {Protocols.Protobuf.PBClass.MyGuild.RoleGroup} RoleGroup
                     */
                    RoleGroup.fromObject = function fromObject(object) {
                        if (object instanceof $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup)
                            return object;
                        let message = new $root.Protocols.Protobuf.PBClass.MyGuild.RoleGroup();
                        if (object.group_id != null)
                            if ($util.Long)
                                (message.group_id = $util.Long.fromValue(object.group_id)).unsigned = false;
                            else if (typeof object.group_id === "string")
                                message.group_id = parseInt(object.group_id, 10);
                            else if (typeof object.group_id === "number")
                                message.group_id = object.group_id;
                            else if (typeof object.group_id === "object")
                                message.group_id = new $util.LongBits(object.group_id.low >>> 0, object.group_id.high >>> 0).toNumber();
                        if (object.guild_id != null)
                            if ($util.Long)
                                (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                            else if (typeof object.guild_id === "string")
                                message.guild_id = parseInt(object.guild_id, 10);
                            else if (typeof object.guild_id === "number")
                                message.guild_id = object.guild_id;
                            else if (typeof object.guild_id === "object")
                                message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                        if (object.sort != null)
                            message.sort = object.sort | 0;
                        if (object.name != null)
                            message.name = String(object.name);
                        if (object.type != null)
                            message.type = object.type | 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from a RoleGroup message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {Protocols.Protobuf.PBClass.MyGuild.RoleGroup} message RoleGroup
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RoleGroup.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.group_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.group_id = options.longs === String ? "0" : 0;
                            if ($util.Long) {
                                let long = new $util.Long(0, 0, false);
                                object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                            } else
                                object.guild_id = options.longs === String ? "0" : 0;
                            object.sort = 0;
                            object.name = "";
                            object.type = 0;
                        }
                        if (message.group_id != null && message.hasOwnProperty("group_id"))
                            if (typeof message.group_id === "number")
                                object.group_id = options.longs === String ? String(message.group_id) : message.group_id;
                            else
                                object.group_id = options.longs === String ? $util.Long.prototype.toString.call(message.group_id) : options.longs === Number ? new $util.LongBits(message.group_id.low >>> 0, message.group_id.high >>> 0).toNumber() : message.group_id;
                        if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                            if (typeof message.guild_id === "number")
                                object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                            else
                                object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                        if (message.sort != null && message.hasOwnProperty("sort"))
                            object.sort = message.sort;
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = message.type;
                        return object;
                    };

                    /**
                     * Converts this RoleGroup to JSON.
                     * @function toJSON
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RoleGroup.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RoleGroup
                     * @function getTypeUrl
                     * @memberof Protocols.Protobuf.PBClass.MyGuild.RoleGroup
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RoleGroup.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MyGuild.RoleGroup";
                    };

                    return RoleGroup;
                })();

                return MyGuild;
            })();

            PBClass.NotPull = (function() {

                /**
                 * Properties of a NotPull.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface INotPull
                 * @property {number|null} [ack] NotPull ack
                 * @property {number|null} [t] NotPull t
                 * @property {number|null} [pull_time] NotPull pull_time
                 * @property {Array.<number>|null} [no_display] NotPull no_display
                 * @property {Object.<string,string>|null} [descs] NotPull descs
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IChannelData>|null} [channel_data] NotPull channel_data
                 * @property {number|null} [seq] NotPull seq
                 * @property {number|null} [clean] NotPull clean
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IReactionInfo>|null} [reactions] NotPull reactions
                 * @property {Object.<string,number>|null} [up_last] NotPull up_last
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IReadChannelList>|null} [read_lists] NotPull read_lists
                 */

                /**
                 * Constructs a new NotPull.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a NotPull.
                 * @implements INotPull
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.INotPull=} [properties] Properties to set
                 */
                function NotPull(properties) {
                    this.no_display = [];
                    this.descs = {};
                    this.channel_data = {};
                    this.reactions = {};
                    this.up_last = {};
                    this.read_lists = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * NotPull ack.
                 * @member {number} ack
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.ack = 0;

                /**
                 * NotPull t.
                 * @member {number} t
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.t = 0;

                /**
                 * NotPull pull_time.
                 * @member {number} pull_time
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.pull_time = 0;

                /**
                 * NotPull no_display.
                 * @member {Array.<number>} no_display
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.no_display = $util.emptyArray;

                /**
                 * NotPull descs.
                 * @member {Object.<string,string>} descs
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.descs = $util.emptyObject;

                /**
                 * NotPull channel_data.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IChannelData>} channel_data
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.channel_data = $util.emptyObject;

                /**
                 * NotPull seq.
                 * @member {number} seq
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.seq = 0;

                /**
                 * NotPull clean.
                 * @member {number} clean
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.clean = 0;

                /**
                 * NotPull reactions.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IReactionInfo>} reactions
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.reactions = $util.emptyObject;

                /**
                 * NotPull up_last.
                 * @member {Object.<string,number>} up_last
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.up_last = $util.emptyObject;

                /**
                 * NotPull read_lists.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IReadChannelList>} read_lists
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 */
                NotPull.prototype.read_lists = $util.emptyObject;

                /**
                 * Creates a new NotPull instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Protocols.Protobuf.PBClass.INotPull=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.NotPull} NotPull instance
                 */
                NotPull.create = function create(properties) {
                    return new NotPull(properties);
                };

                /**
                 * Encodes the specified NotPull message. Does not implicitly {@link Protocols.Protobuf.PBClass.NotPull.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Protocols.Protobuf.PBClass.INotPull} message NotPull message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                NotPull.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.ack != null && Object.hasOwnProperty.call(message, "ack"))
                        writer.uint32(/* id 1, wireType 5 =*/13).fixed32(message.ack);
                    if (message.t != null && Object.hasOwnProperty.call(message, "t"))
                        writer.uint32(/* id 2, wireType 5 =*/21).fixed32(message.t);
                    if (message.pull_time != null && Object.hasOwnProperty.call(message, "pull_time"))
                        writer.uint32(/* id 3, wireType 5 =*/29).fixed32(message.pull_time);
                    if (message.no_display != null && message.no_display.length) {
                        writer.uint32(/* id 5, wireType 2 =*/42).fork();
                        for (let i = 0; i < message.no_display.length; ++i)
                            writer.fixed64(message.no_display[i]);
                        writer.ldelim();
                    }
                    if (message.descs != null && Object.hasOwnProperty.call(message, "descs"))
                        for (let keys = Object.keys(message.descs), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.descs[keys[i]]).ldelim();
                    if (message.channel_data != null && Object.hasOwnProperty.call(message, "channel_data"))
                        for (let keys = Object.keys(message.channel_data), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 7, wireType 2 =*/58).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ChannelData.encode(message.channel_data[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                        writer.uint32(/* id 8, wireType 5 =*/69).fixed32(message.seq);
                    if (message.clean != null && Object.hasOwnProperty.call(message, "clean"))
                        writer.uint32(/* id 9, wireType 0 =*/72).int32(message.clean);
                    if (message.reactions != null && Object.hasOwnProperty.call(message, "reactions"))
                        for (let keys = Object.keys(message.reactions), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 10, wireType 2 =*/82).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ReactionInfo.encode(message.reactions[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.up_last != null && Object.hasOwnProperty.call(message, "up_last"))
                        for (let keys = Object.keys(message.up_last), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 1 =*/17).fixed64(message.up_last[keys[i]]).ldelim();
                    if (message.read_lists != null && Object.hasOwnProperty.call(message, "read_lists"))
                        for (let keys = Object.keys(message.read_lists), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 12, wireType 2 =*/98).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ReadChannelList.encode(message.read_lists[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    return writer;
                };

                /**
                 * Encodes the specified NotPull message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.NotPull.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Protocols.Protobuf.PBClass.INotPull} message NotPull message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                NotPull.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a NotPull message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.NotPull} NotPull
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                NotPull.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.NotPull(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.ack = reader.fixed32();
                                break;
                            }
                        case 2: {
                                message.t = reader.fixed32();
                                break;
                            }
                        case 3: {
                                message.pull_time = reader.fixed32();
                                break;
                            }
                        case 5: {
                                if (!(message.no_display && message.no_display.length))
                                    message.no_display = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.no_display.push(reader.fixed64());
                                } else
                                    message.no_display.push(reader.fixed64());
                                break;
                            }
                        case 6: {
                                if (message.descs === $util.emptyObject)
                                    message.descs = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.descs[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 7: {
                                if (message.channel_data === $util.emptyObject)
                                    message.channel_data = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ChannelData.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.channel_data[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 8: {
                                message.seq = reader.fixed32();
                                break;
                            }
                        case 9: {
                                message.clean = reader.int32();
                                break;
                            }
                        case 10: {
                                if (message.reactions === $util.emptyObject)
                                    message.reactions = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ReactionInfo.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.reactions[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 11: {
                                if (message.up_last === $util.emptyObject)
                                    message.up_last = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = 0;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.fixed64();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.up_last[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 12: {
                                if (message.read_lists === $util.emptyObject)
                                    message.read_lists = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ReadChannelList.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.read_lists[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a NotPull message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.NotPull} NotPull
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                NotPull.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a NotPull message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                NotPull.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.ack != null && message.hasOwnProperty("ack"))
                        if (!$util.isInteger(message.ack))
                            return "ack: integer expected";
                    if (message.t != null && message.hasOwnProperty("t"))
                        if (!$util.isInteger(message.t))
                            return "t: integer expected";
                    if (message.pull_time != null && message.hasOwnProperty("pull_time"))
                        if (!$util.isInteger(message.pull_time))
                            return "pull_time: integer expected";
                    if (message.no_display != null && message.hasOwnProperty("no_display")) {
                        if (!Array.isArray(message.no_display))
                            return "no_display: array expected";
                        for (let i = 0; i < message.no_display.length; ++i)
                            if (!$util.isInteger(message.no_display[i]) && !(message.no_display[i] && $util.isInteger(message.no_display[i].low) && $util.isInteger(message.no_display[i].high)))
                                return "no_display: integer|Long[] expected";
                    }
                    if (message.descs != null && message.hasOwnProperty("descs")) {
                        if (!$util.isObject(message.descs))
                            return "descs: object expected";
                        let key = Object.keys(message.descs);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "descs: integer|Long key{k:fixed64} expected";
                            if (!$util.isString(message.descs[key[i]]))
                                return "descs: string{k:fixed64} expected";
                        }
                    }
                    if (message.channel_data != null && message.hasOwnProperty("channel_data")) {
                        if (!$util.isObject(message.channel_data))
                            return "channel_data: object expected";
                        let key = Object.keys(message.channel_data);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "channel_data: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ChannelData.verify(message.channel_data[key[i]]);
                                if (error)
                                    return "channel_data." + error;
                            }
                        }
                    }
                    if (message.seq != null && message.hasOwnProperty("seq"))
                        if (!$util.isInteger(message.seq))
                            return "seq: integer expected";
                    if (message.clean != null && message.hasOwnProperty("clean"))
                        if (!$util.isInteger(message.clean))
                            return "clean: integer expected";
                    if (message.reactions != null && message.hasOwnProperty("reactions")) {
                        if (!$util.isObject(message.reactions))
                            return "reactions: object expected";
                        let key = Object.keys(message.reactions);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "reactions: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ReactionInfo.verify(message.reactions[key[i]]);
                                if (error)
                                    return "reactions." + error;
                            }
                        }
                    }
                    if (message.up_last != null && message.hasOwnProperty("up_last")) {
                        if (!$util.isObject(message.up_last))
                            return "up_last: object expected";
                        let key = Object.keys(message.up_last);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "up_last: integer|Long key{k:fixed64} expected";
                            if (!$util.isInteger(message.up_last[key[i]]) && !(message.up_last[key[i]] && $util.isInteger(message.up_last[key[i]].low) && $util.isInteger(message.up_last[key[i]].high)))
                                return "up_last: integer|Long{k:fixed64} expected";
                        }
                    }
                    if (message.read_lists != null && message.hasOwnProperty("read_lists")) {
                        if (!$util.isObject(message.read_lists))
                            return "read_lists: object expected";
                        let key = Object.keys(message.read_lists);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "read_lists: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ReadChannelList.verify(message.read_lists[key[i]]);
                                if (error)
                                    return "read_lists." + error;
                            }
                        }
                    }
                    return null;
                };

                /**
                 * Creates a NotPull message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.NotPull} NotPull
                 */
                NotPull.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.NotPull)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.NotPull();
                    if (object.ack != null)
                        message.ack = object.ack >>> 0;
                    if (object.t != null)
                        message.t = object.t >>> 0;
                    if (object.pull_time != null)
                        message.pull_time = object.pull_time >>> 0;
                    if (object.no_display) {
                        if (!Array.isArray(object.no_display))
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.no_display: array expected");
                        message.no_display = [];
                        for (let i = 0; i < object.no_display.length; ++i)
                            if ($util.Long)
                                (message.no_display[i] = $util.Long.fromValue(object.no_display[i])).unsigned = false;
                            else if (typeof object.no_display[i] === "string")
                                message.no_display[i] = parseInt(object.no_display[i], 10);
                            else if (typeof object.no_display[i] === "number")
                                message.no_display[i] = object.no_display[i];
                            else if (typeof object.no_display[i] === "object")
                                message.no_display[i] = new $util.LongBits(object.no_display[i].low >>> 0, object.no_display[i].high >>> 0).toNumber();
                    }
                    if (object.descs) {
                        if (typeof object.descs !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.descs: object expected");
                        message.descs = {};
                        for (let keys = Object.keys(object.descs), i = 0; i < keys.length; ++i)
                            message.descs[keys[i]] = String(object.descs[keys[i]]);
                    }
                    if (object.channel_data) {
                        if (typeof object.channel_data !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.channel_data: object expected");
                        message.channel_data = {};
                        for (let keys = Object.keys(object.channel_data), i = 0; i < keys.length; ++i) {
                            if (typeof object.channel_data[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.NotPull.channel_data: object expected");
                            message.channel_data[keys[i]] = $root.Protocols.Protobuf.PBClass.ChannelData.fromObject(object.channel_data[keys[i]]);
                        }
                    }
                    if (object.seq != null)
                        message.seq = object.seq >>> 0;
                    if (object.clean != null)
                        message.clean = object.clean | 0;
                    if (object.reactions) {
                        if (typeof object.reactions !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.reactions: object expected");
                        message.reactions = {};
                        for (let keys = Object.keys(object.reactions), i = 0; i < keys.length; ++i) {
                            if (typeof object.reactions[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.NotPull.reactions: object expected");
                            message.reactions[keys[i]] = $root.Protocols.Protobuf.PBClass.ReactionInfo.fromObject(object.reactions[keys[i]]);
                        }
                    }
                    if (object.up_last) {
                        if (typeof object.up_last !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.up_last: object expected");
                        message.up_last = {};
                        for (let keys = Object.keys(object.up_last), i = 0; i < keys.length; ++i)
                            if ($util.Long)
                                (message.up_last[keys[i]] = $util.Long.fromValue(object.up_last[keys[i]])).unsigned = false;
                            else if (typeof object.up_last[keys[i]] === "string")
                                message.up_last[keys[i]] = parseInt(object.up_last[keys[i]], 10);
                            else if (typeof object.up_last[keys[i]] === "number")
                                message.up_last[keys[i]] = object.up_last[keys[i]];
                            else if (typeof object.up_last[keys[i]] === "object")
                                message.up_last[keys[i]] = new $util.LongBits(object.up_last[keys[i]].low >>> 0, object.up_last[keys[i]].high >>> 0).toNumber();
                    }
                    if (object.read_lists) {
                        if (typeof object.read_lists !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.NotPull.read_lists: object expected");
                        message.read_lists = {};
                        for (let keys = Object.keys(object.read_lists), i = 0; i < keys.length; ++i) {
                            if (typeof object.read_lists[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.NotPull.read_lists: object expected");
                            message.read_lists[keys[i]] = $root.Protocols.Protobuf.PBClass.ReadChannelList.fromObject(object.read_lists[keys[i]]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a NotPull message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {Protocols.Protobuf.PBClass.NotPull} message NotPull
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                NotPull.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.no_display = [];
                    if (options.objects || options.defaults) {
                        object.descs = {};
                        object.channel_data = {};
                        object.reactions = {};
                        object.up_last = {};
                        object.read_lists = {};
                    }
                    if (options.defaults) {
                        object.ack = 0;
                        object.t = 0;
                        object.pull_time = 0;
                        object.seq = 0;
                        object.clean = 0;
                    }
                    if (message.ack != null && message.hasOwnProperty("ack"))
                        object.ack = message.ack;
                    if (message.t != null && message.hasOwnProperty("t"))
                        object.t = message.t;
                    if (message.pull_time != null && message.hasOwnProperty("pull_time"))
                        object.pull_time = message.pull_time;
                    if (message.no_display && message.no_display.length) {
                        object.no_display = [];
                        for (let j = 0; j < message.no_display.length; ++j)
                            if (typeof message.no_display[j] === "number")
                                object.no_display[j] = options.longs === String ? String(message.no_display[j]) : message.no_display[j];
                            else
                                object.no_display[j] = options.longs === String ? $util.Long.prototype.toString.call(message.no_display[j]) : options.longs === Number ? new $util.LongBits(message.no_display[j].low >>> 0, message.no_display[j].high >>> 0).toNumber() : message.no_display[j];
                    }
                    let keys2;
                    if (message.descs && (keys2 = Object.keys(message.descs)).length) {
                        object.descs = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.descs[keys2[j]] = message.descs[keys2[j]];
                    }
                    if (message.channel_data && (keys2 = Object.keys(message.channel_data)).length) {
                        object.channel_data = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.channel_data[keys2[j]] = $root.Protocols.Protobuf.PBClass.ChannelData.toObject(message.channel_data[keys2[j]], options);
                    }
                    if (message.seq != null && message.hasOwnProperty("seq"))
                        object.seq = message.seq;
                    if (message.clean != null && message.hasOwnProperty("clean"))
                        object.clean = message.clean;
                    if (message.reactions && (keys2 = Object.keys(message.reactions)).length) {
                        object.reactions = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.reactions[keys2[j]] = $root.Protocols.Protobuf.PBClass.ReactionInfo.toObject(message.reactions[keys2[j]], options);
                    }
                    if (message.up_last && (keys2 = Object.keys(message.up_last)).length) {
                        object.up_last = {};
                        for (let j = 0; j < keys2.length; ++j)
                            if (typeof message.up_last[keys2[j]] === "number")
                                object.up_last[keys2[j]] = options.longs === String ? String(message.up_last[keys2[j]]) : message.up_last[keys2[j]];
                            else
                                object.up_last[keys2[j]] = options.longs === String ? $util.Long.prototype.toString.call(message.up_last[keys2[j]]) : options.longs === Number ? new $util.LongBits(message.up_last[keys2[j]].low >>> 0, message.up_last[keys2[j]].high >>> 0).toNumber() : message.up_last[keys2[j]];
                    }
                    if (message.read_lists && (keys2 = Object.keys(message.read_lists)).length) {
                        object.read_lists = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.read_lists[keys2[j]] = $root.Protocols.Protobuf.PBClass.ReadChannelList.toObject(message.read_lists[keys2[j]], options);
                    }
                    return object;
                };

                /**
                 * Converts this NotPull to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                NotPull.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for NotPull
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.NotPull
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                NotPull.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.NotPull";
                };

                return NotPull;
            })();

            /**
             * MessageType enum.
             * @name Protocols.Protobuf.PBClass.MessageType
             * @enum {number}
             * @property {number} NORMAL=0 NORMAL value
             * @property {number} RESET=1 RESET value
             * @property {number} PIN=2 PIN value
             * @property {number} UNPIN=3 UNPIN value
             * @property {number} RECALL=4 RECALL value
             * @property {number} START_MESSAGE=5 START_MESSAGE value
             * @property {number} BOT_HIDE=6 BOT_HIDE value
             * @property {number} TOPIC=7 TOPIC value
             * @property {number} TOPIC_REFRESH=8 TOPIC_REFRESH value
             * @property {number} CIRCLE_POST=9 CIRCLE_POST value
             * @property {number} deleted=10 deleted value
             * @property {number} deteled_user=11 deteled_user value
             * @property {number} task_done=12 task_done value
             * @property {number} task_wait=13 task_wait value
             * @property {number} new_apply_friend=14 new_apply_friend value
             * @property {number} follow=15 follow value
             */
            PBClass.MessageType = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "NORMAL"] = 0;
                values[valuesById[1] = "RESET"] = 1;
                values[valuesById[2] = "PIN"] = 2;
                values[valuesById[3] = "UNPIN"] = 3;
                values[valuesById[4] = "RECALL"] = 4;
                values[valuesById[5] = "START_MESSAGE"] = 5;
                values[valuesById[6] = "BOT_HIDE"] = 6;
                values[valuesById[7] = "TOPIC"] = 7;
                values[valuesById[8] = "TOPIC_REFRESH"] = 8;
                values[valuesById[9] = "CIRCLE_POST"] = 9;
                values[valuesById[10] = "deleted"] = 10;
                values[valuesById[11] = "deteled_user"] = 11;
                values[valuesById[12] = "task_done"] = 12;
                values[valuesById[13] = "task_wait"] = 13;
                values[valuesById[14] = "new_apply_friend"] = 14;
                values[valuesById[15] = "follow"] = 15;
                return values;
            })();

            PBClass.ChannelData = (function() {

                /**
                 * Properties of a ChannelData.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IChannelData
                 * @property {Array.<Uint8Array>|null} [lists] ChannelData lists
                 */

                /**
                 * Constructs a new ChannelData.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a ChannelData.
                 * @implements IChannelData
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IChannelData=} [properties] Properties to set
                 */
                function ChannelData(properties) {
                    this.lists = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ChannelData lists.
                 * @member {Array.<Uint8Array>} lists
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @instance
                 */
                ChannelData.prototype.lists = $util.emptyArray;

                /**
                 * Creates a new ChannelData instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelData=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.ChannelData} ChannelData instance
                 */
                ChannelData.create = function create(properties) {
                    return new ChannelData(properties);
                };

                /**
                 * Encodes the specified ChannelData message. Does not implicitly {@link Protocols.Protobuf.PBClass.ChannelData.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelData} message ChannelData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChannelData.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.lists != null && message.lists.length)
                        for (let i = 0; i < message.lists.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.lists[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ChannelData message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.ChannelData.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelData} message ChannelData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChannelData.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ChannelData message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.ChannelData} ChannelData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChannelData.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.ChannelData();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.lists && message.lists.length))
                                    message.lists = [];
                                message.lists.push(reader.bytes());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ChannelData message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.ChannelData} ChannelData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChannelData.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ChannelData message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ChannelData.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.lists != null && message.hasOwnProperty("lists")) {
                        if (!Array.isArray(message.lists))
                            return "lists: array expected";
                        for (let i = 0; i < message.lists.length; ++i)
                            if (!(message.lists[i] && typeof message.lists[i].length === "number" || $util.isString(message.lists[i])))
                                return "lists: buffer[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a ChannelData message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.ChannelData} ChannelData
                 */
                ChannelData.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.ChannelData)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.ChannelData();
                    if (object.lists) {
                        if (!Array.isArray(object.lists))
                            throw TypeError(".Protocols.Protobuf.PBClass.ChannelData.lists: array expected");
                        message.lists = [];
                        for (let i = 0; i < object.lists.length; ++i)
                            if (typeof object.lists[i] === "string")
                                $util.base64.decode(object.lists[i], message.lists[i] = $util.newBuffer($util.base64.length(object.lists[i])), 0);
                            else if (object.lists[i].length >= 0)
                                message.lists[i] = object.lists[i];
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ChannelData message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.ChannelData} message ChannelData
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ChannelData.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.lists = [];
                    if (message.lists && message.lists.length) {
                        object.lists = [];
                        for (let j = 0; j < message.lists.length; ++j)
                            object.lists[j] = options.bytes === String ? $util.base64.encode(message.lists[j], 0, message.lists[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.lists[j]) : message.lists[j];
                    }
                    return object;
                };

                /**
                 * Converts this ChannelData to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ChannelData.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ChannelData
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.ChannelData
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ChannelData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.ChannelData";
                };

                return ChannelData;
            })();

            PBClass.MessageInfo = (function() {

                /**
                 * Properties of a MessageInfo.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IMessageInfo
                 * @property {Protocols.Protobuf.PBClass.MessageType|null} [m_type] MessageInfo m_type
                 * @property {number|null} [message_id] MessageInfo message_id
                 * @property {number|null} [user_id] MessageInfo user_id
                 * @property {number|null} [operation_message_id] MessageInfo operation_message_id
                 * @property {Array.<number>|null} [mentions] MessageInfo mentions
                 * @property {Array.<number>|null} [mention_roles] MessageInfo mention_roles
                 * @property {number|null} [post_id] MessageInfo post_id
                 * @property {number|null} [comment_id] MessageInfo comment_id
                 * @property {number|null} [quote_id] MessageInfo quote_id
                 * @property {string|null} [circle_type] MessageInfo circle_type
                 * @property {number|null} [channel_id] MessageInfo channel_id
                 * @property {number|null} [guild_id] MessageInfo guild_id
                 * @property {number|null} [src_channel_id] MessageInfo src_channel_id
                 * @property {Array.<number>|null} [display_role_id] MessageInfo display_role_id
                 * @property {number|null} [src_message_id] MessageInfo src_message_id
                 */

                /**
                 * Constructs a new MessageInfo.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a MessageInfo.
                 * @implements IMessageInfo
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IMessageInfo=} [properties] Properties to set
                 */
                function MessageInfo(properties) {
                    this.mentions = [];
                    this.mention_roles = [];
                    this.display_role_id = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MessageInfo m_type.
                 * @member {Protocols.Protobuf.PBClass.MessageType} m_type
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.m_type = 0;

                /**
                 * MessageInfo message_id.
                 * @member {number} message_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.message_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo user_id.
                 * @member {number} user_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.user_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo operation_message_id.
                 * @member {number} operation_message_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.operation_message_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo mentions.
                 * @member {Array.<number>} mentions
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.mentions = $util.emptyArray;

                /**
                 * MessageInfo mention_roles.
                 * @member {Array.<number>} mention_roles
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.mention_roles = $util.emptyArray;

                /**
                 * MessageInfo post_id.
                 * @member {number} post_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.post_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo comment_id.
                 * @member {number} comment_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.comment_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo quote_id.
                 * @member {number} quote_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.quote_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo circle_type.
                 * @member {string} circle_type
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.circle_type = "";

                /**
                 * MessageInfo channel_id.
                 * @member {number} channel_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo guild_id.
                 * @member {number} guild_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.guild_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo src_channel_id.
                 * @member {number} src_channel_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.src_channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * MessageInfo display_role_id.
                 * @member {Array.<number>} display_role_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.display_role_id = $util.emptyArray;

                /**
                 * MessageInfo src_message_id.
                 * @member {number} src_message_id
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 */
                MessageInfo.prototype.src_message_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Creates a new MessageInfo instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IMessageInfo=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.MessageInfo} MessageInfo instance
                 */
                MessageInfo.create = function create(properties) {
                    return new MessageInfo(properties);
                };

                /**
                 * Encodes the specified MessageInfo message. Does not implicitly {@link Protocols.Protobuf.PBClass.MessageInfo.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IMessageInfo} message MessageInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MessageInfo.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.m_type != null && Object.hasOwnProperty.call(message, "m_type"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.m_type);
                    if (message.message_id != null && Object.hasOwnProperty.call(message, "message_id"))
                        writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.message_id);
                    if (message.user_id != null && Object.hasOwnProperty.call(message, "user_id"))
                        writer.uint32(/* id 3, wireType 1 =*/25).fixed64(message.user_id);
                    if (message.operation_message_id != null && Object.hasOwnProperty.call(message, "operation_message_id"))
                        writer.uint32(/* id 4, wireType 1 =*/33).fixed64(message.operation_message_id);
                    if (message.mentions != null && message.mentions.length) {
                        writer.uint32(/* id 5, wireType 2 =*/42).fork();
                        for (let i = 0; i < message.mentions.length; ++i)
                            writer.fixed64(message.mentions[i]);
                        writer.ldelim();
                    }
                    if (message.mention_roles != null && message.mention_roles.length) {
                        writer.uint32(/* id 6, wireType 2 =*/50).fork();
                        for (let i = 0; i < message.mention_roles.length; ++i)
                            writer.fixed64(message.mention_roles[i]);
                        writer.ldelim();
                    }
                    if (message.post_id != null && Object.hasOwnProperty.call(message, "post_id"))
                        writer.uint32(/* id 7, wireType 1 =*/57).fixed64(message.post_id);
                    if (message.comment_id != null && Object.hasOwnProperty.call(message, "comment_id"))
                        writer.uint32(/* id 8, wireType 1 =*/65).fixed64(message.comment_id);
                    if (message.quote_id != null && Object.hasOwnProperty.call(message, "quote_id"))
                        writer.uint32(/* id 9, wireType 1 =*/73).fixed64(message.quote_id);
                    if (message.circle_type != null && Object.hasOwnProperty.call(message, "circle_type"))
                        writer.uint32(/* id 10, wireType 2 =*/82).string(message.circle_type);
                    if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                        writer.uint32(/* id 11, wireType 1 =*/89).fixed64(message.channel_id);
                    if (message.guild_id != null && Object.hasOwnProperty.call(message, "guild_id"))
                        writer.uint32(/* id 12, wireType 1 =*/97).fixed64(message.guild_id);
                    if (message.src_channel_id != null && Object.hasOwnProperty.call(message, "src_channel_id"))
                        writer.uint32(/* id 13, wireType 1 =*/105).fixed64(message.src_channel_id);
                    if (message.display_role_id != null && message.display_role_id.length) {
                        writer.uint32(/* id 14, wireType 2 =*/114).fork();
                        for (let i = 0; i < message.display_role_id.length; ++i)
                            writer.fixed64(message.display_role_id[i]);
                        writer.ldelim();
                    }
                    if (message.src_message_id != null && Object.hasOwnProperty.call(message, "src_message_id"))
                        writer.uint32(/* id 15, wireType 1 =*/121).fixed64(message.src_message_id);
                    return writer;
                };

                /**
                 * Encodes the specified MessageInfo message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.MessageInfo.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IMessageInfo} message MessageInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MessageInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MessageInfo message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.MessageInfo} MessageInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MessageInfo.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.MessageInfo();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.m_type = reader.int32();
                                break;
                            }
                        case 2: {
                                message.message_id = reader.fixed64();
                                break;
                            }
                        case 3: {
                                message.user_id = reader.fixed64();
                                break;
                            }
                        case 4: {
                                message.operation_message_id = reader.fixed64();
                                break;
                            }
                        case 5: {
                                if (!(message.mentions && message.mentions.length))
                                    message.mentions = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.mentions.push(reader.fixed64());
                                } else
                                    message.mentions.push(reader.fixed64());
                                break;
                            }
                        case 6: {
                                if (!(message.mention_roles && message.mention_roles.length))
                                    message.mention_roles = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.mention_roles.push(reader.fixed64());
                                } else
                                    message.mention_roles.push(reader.fixed64());
                                break;
                            }
                        case 7: {
                                message.post_id = reader.fixed64();
                                break;
                            }
                        case 8: {
                                message.comment_id = reader.fixed64();
                                break;
                            }
                        case 9: {
                                message.quote_id = reader.fixed64();
                                break;
                            }
                        case 10: {
                                message.circle_type = reader.string();
                                break;
                            }
                        case 11: {
                                message.channel_id = reader.fixed64();
                                break;
                            }
                        case 12: {
                                message.guild_id = reader.fixed64();
                                break;
                            }
                        case 13: {
                                message.src_channel_id = reader.fixed64();
                                break;
                            }
                        case 14: {
                                if (!(message.display_role_id && message.display_role_id.length))
                                    message.display_role_id = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.display_role_id.push(reader.fixed64());
                                } else
                                    message.display_role_id.push(reader.fixed64());
                                break;
                            }
                        case 15: {
                                message.src_message_id = reader.fixed64();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MessageInfo message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.MessageInfo} MessageInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MessageInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MessageInfo message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MessageInfo.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.m_type != null && message.hasOwnProperty("m_type"))
                        switch (message.m_type) {
                        default:
                            return "m_type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                            break;
                        }
                    if (message.message_id != null && message.hasOwnProperty("message_id"))
                        if (!$util.isInteger(message.message_id) && !(message.message_id && $util.isInteger(message.message_id.low) && $util.isInteger(message.message_id.high)))
                            return "message_id: integer|Long expected";
                    if (message.user_id != null && message.hasOwnProperty("user_id"))
                        if (!$util.isInteger(message.user_id) && !(message.user_id && $util.isInteger(message.user_id.low) && $util.isInteger(message.user_id.high)))
                            return "user_id: integer|Long expected";
                    if (message.operation_message_id != null && message.hasOwnProperty("operation_message_id"))
                        if (!$util.isInteger(message.operation_message_id) && !(message.operation_message_id && $util.isInteger(message.operation_message_id.low) && $util.isInteger(message.operation_message_id.high)))
                            return "operation_message_id: integer|Long expected";
                    if (message.mentions != null && message.hasOwnProperty("mentions")) {
                        if (!Array.isArray(message.mentions))
                            return "mentions: array expected";
                        for (let i = 0; i < message.mentions.length; ++i)
                            if (!$util.isInteger(message.mentions[i]) && !(message.mentions[i] && $util.isInteger(message.mentions[i].low) && $util.isInteger(message.mentions[i].high)))
                                return "mentions: integer|Long[] expected";
                    }
                    if (message.mention_roles != null && message.hasOwnProperty("mention_roles")) {
                        if (!Array.isArray(message.mention_roles))
                            return "mention_roles: array expected";
                        for (let i = 0; i < message.mention_roles.length; ++i)
                            if (!$util.isInteger(message.mention_roles[i]) && !(message.mention_roles[i] && $util.isInteger(message.mention_roles[i].low) && $util.isInteger(message.mention_roles[i].high)))
                                return "mention_roles: integer|Long[] expected";
                    }
                    if (message.post_id != null && message.hasOwnProperty("post_id"))
                        if (!$util.isInteger(message.post_id) && !(message.post_id && $util.isInteger(message.post_id.low) && $util.isInteger(message.post_id.high)))
                            return "post_id: integer|Long expected";
                    if (message.comment_id != null && message.hasOwnProperty("comment_id"))
                        if (!$util.isInteger(message.comment_id) && !(message.comment_id && $util.isInteger(message.comment_id.low) && $util.isInteger(message.comment_id.high)))
                            return "comment_id: integer|Long expected";
                    if (message.quote_id != null && message.hasOwnProperty("quote_id"))
                        if (!$util.isInteger(message.quote_id) && !(message.quote_id && $util.isInteger(message.quote_id.low) && $util.isInteger(message.quote_id.high)))
                            return "quote_id: integer|Long expected";
                    if (message.circle_type != null && message.hasOwnProperty("circle_type"))
                        if (!$util.isString(message.circle_type))
                            return "circle_type: string expected";
                    if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                        if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                            return "channel_id: integer|Long expected";
                    if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                        if (!$util.isInteger(message.guild_id) && !(message.guild_id && $util.isInteger(message.guild_id.low) && $util.isInteger(message.guild_id.high)))
                            return "guild_id: integer|Long expected";
                    if (message.src_channel_id != null && message.hasOwnProperty("src_channel_id"))
                        if (!$util.isInteger(message.src_channel_id) && !(message.src_channel_id && $util.isInteger(message.src_channel_id.low) && $util.isInteger(message.src_channel_id.high)))
                            return "src_channel_id: integer|Long expected";
                    if (message.display_role_id != null && message.hasOwnProperty("display_role_id")) {
                        if (!Array.isArray(message.display_role_id))
                            return "display_role_id: array expected";
                        for (let i = 0; i < message.display_role_id.length; ++i)
                            if (!$util.isInteger(message.display_role_id[i]) && !(message.display_role_id[i] && $util.isInteger(message.display_role_id[i].low) && $util.isInteger(message.display_role_id[i].high)))
                                return "display_role_id: integer|Long[] expected";
                    }
                    if (message.src_message_id != null && message.hasOwnProperty("src_message_id"))
                        if (!$util.isInteger(message.src_message_id) && !(message.src_message_id && $util.isInteger(message.src_message_id.low) && $util.isInteger(message.src_message_id.high)))
                            return "src_message_id: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a MessageInfo message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.MessageInfo} MessageInfo
                 */
                MessageInfo.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.MessageInfo)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.MessageInfo();
                    switch (object.m_type) {
                    default:
                        if (typeof object.m_type === "number") {
                            message.m_type = object.m_type;
                            break;
                        }
                        break;
                    case "NORMAL":
                    case 0:
                        message.m_type = 0;
                        break;
                    case "RESET":
                    case 1:
                        message.m_type = 1;
                        break;
                    case "PIN":
                    case 2:
                        message.m_type = 2;
                        break;
                    case "UNPIN":
                    case 3:
                        message.m_type = 3;
                        break;
                    case "RECALL":
                    case 4:
                        message.m_type = 4;
                        break;
                    case "START_MESSAGE":
                    case 5:
                        message.m_type = 5;
                        break;
                    case "BOT_HIDE":
                    case 6:
                        message.m_type = 6;
                        break;
                    case "TOPIC":
                    case 7:
                        message.m_type = 7;
                        break;
                    case "TOPIC_REFRESH":
                    case 8:
                        message.m_type = 8;
                        break;
                    case "CIRCLE_POST":
                    case 9:
                        message.m_type = 9;
                        break;
                    case "deleted":
                    case 10:
                        message.m_type = 10;
                        break;
                    case "deteled_user":
                    case 11:
                        message.m_type = 11;
                        break;
                    case "task_done":
                    case 12:
                        message.m_type = 12;
                        break;
                    case "task_wait":
                    case 13:
                        message.m_type = 13;
                        break;
                    case "new_apply_friend":
                    case 14:
                        message.m_type = 14;
                        break;
                    case "follow":
                    case 15:
                        message.m_type = 15;
                        break;
                    }
                    if (object.message_id != null)
                        if ($util.Long)
                            (message.message_id = $util.Long.fromValue(object.message_id)).unsigned = false;
                        else if (typeof object.message_id === "string")
                            message.message_id = parseInt(object.message_id, 10);
                        else if (typeof object.message_id === "number")
                            message.message_id = object.message_id;
                        else if (typeof object.message_id === "object")
                            message.message_id = new $util.LongBits(object.message_id.low >>> 0, object.message_id.high >>> 0).toNumber();
                    if (object.user_id != null)
                        if ($util.Long)
                            (message.user_id = $util.Long.fromValue(object.user_id)).unsigned = false;
                        else if (typeof object.user_id === "string")
                            message.user_id = parseInt(object.user_id, 10);
                        else if (typeof object.user_id === "number")
                            message.user_id = object.user_id;
                        else if (typeof object.user_id === "object")
                            message.user_id = new $util.LongBits(object.user_id.low >>> 0, object.user_id.high >>> 0).toNumber();
                    if (object.operation_message_id != null)
                        if ($util.Long)
                            (message.operation_message_id = $util.Long.fromValue(object.operation_message_id)).unsigned = false;
                        else if (typeof object.operation_message_id === "string")
                            message.operation_message_id = parseInt(object.operation_message_id, 10);
                        else if (typeof object.operation_message_id === "number")
                            message.operation_message_id = object.operation_message_id;
                        else if (typeof object.operation_message_id === "object")
                            message.operation_message_id = new $util.LongBits(object.operation_message_id.low >>> 0, object.operation_message_id.high >>> 0).toNumber();
                    if (object.mentions) {
                        if (!Array.isArray(object.mentions))
                            throw TypeError(".Protocols.Protobuf.PBClass.MessageInfo.mentions: array expected");
                        message.mentions = [];
                        for (let i = 0; i < object.mentions.length; ++i)
                            if ($util.Long)
                                (message.mentions[i] = $util.Long.fromValue(object.mentions[i])).unsigned = false;
                            else if (typeof object.mentions[i] === "string")
                                message.mentions[i] = parseInt(object.mentions[i], 10);
                            else if (typeof object.mentions[i] === "number")
                                message.mentions[i] = object.mentions[i];
                            else if (typeof object.mentions[i] === "object")
                                message.mentions[i] = new $util.LongBits(object.mentions[i].low >>> 0, object.mentions[i].high >>> 0).toNumber();
                    }
                    if (object.mention_roles) {
                        if (!Array.isArray(object.mention_roles))
                            throw TypeError(".Protocols.Protobuf.PBClass.MessageInfo.mention_roles: array expected");
                        message.mention_roles = [];
                        for (let i = 0; i < object.mention_roles.length; ++i)
                            if ($util.Long)
                                (message.mention_roles[i] = $util.Long.fromValue(object.mention_roles[i])).unsigned = false;
                            else if (typeof object.mention_roles[i] === "string")
                                message.mention_roles[i] = parseInt(object.mention_roles[i], 10);
                            else if (typeof object.mention_roles[i] === "number")
                                message.mention_roles[i] = object.mention_roles[i];
                            else if (typeof object.mention_roles[i] === "object")
                                message.mention_roles[i] = new $util.LongBits(object.mention_roles[i].low >>> 0, object.mention_roles[i].high >>> 0).toNumber();
                    }
                    if (object.post_id != null)
                        if ($util.Long)
                            (message.post_id = $util.Long.fromValue(object.post_id)).unsigned = false;
                        else if (typeof object.post_id === "string")
                            message.post_id = parseInt(object.post_id, 10);
                        else if (typeof object.post_id === "number")
                            message.post_id = object.post_id;
                        else if (typeof object.post_id === "object")
                            message.post_id = new $util.LongBits(object.post_id.low >>> 0, object.post_id.high >>> 0).toNumber();
                    if (object.comment_id != null)
                        if ($util.Long)
                            (message.comment_id = $util.Long.fromValue(object.comment_id)).unsigned = false;
                        else if (typeof object.comment_id === "string")
                            message.comment_id = parseInt(object.comment_id, 10);
                        else if (typeof object.comment_id === "number")
                            message.comment_id = object.comment_id;
                        else if (typeof object.comment_id === "object")
                            message.comment_id = new $util.LongBits(object.comment_id.low >>> 0, object.comment_id.high >>> 0).toNumber();
                    if (object.quote_id != null)
                        if ($util.Long)
                            (message.quote_id = $util.Long.fromValue(object.quote_id)).unsigned = false;
                        else if (typeof object.quote_id === "string")
                            message.quote_id = parseInt(object.quote_id, 10);
                        else if (typeof object.quote_id === "number")
                            message.quote_id = object.quote_id;
                        else if (typeof object.quote_id === "object")
                            message.quote_id = new $util.LongBits(object.quote_id.low >>> 0, object.quote_id.high >>> 0).toNumber();
                    if (object.circle_type != null)
                        message.circle_type = String(object.circle_type);
                    if (object.channel_id != null)
                        if ($util.Long)
                            (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                        else if (typeof object.channel_id === "string")
                            message.channel_id = parseInt(object.channel_id, 10);
                        else if (typeof object.channel_id === "number")
                            message.channel_id = object.channel_id;
                        else if (typeof object.channel_id === "object")
                            message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                    if (object.guild_id != null)
                        if ($util.Long)
                            (message.guild_id = $util.Long.fromValue(object.guild_id)).unsigned = false;
                        else if (typeof object.guild_id === "string")
                            message.guild_id = parseInt(object.guild_id, 10);
                        else if (typeof object.guild_id === "number")
                            message.guild_id = object.guild_id;
                        else if (typeof object.guild_id === "object")
                            message.guild_id = new $util.LongBits(object.guild_id.low >>> 0, object.guild_id.high >>> 0).toNumber();
                    if (object.src_channel_id != null)
                        if ($util.Long)
                            (message.src_channel_id = $util.Long.fromValue(object.src_channel_id)).unsigned = false;
                        else if (typeof object.src_channel_id === "string")
                            message.src_channel_id = parseInt(object.src_channel_id, 10);
                        else if (typeof object.src_channel_id === "number")
                            message.src_channel_id = object.src_channel_id;
                        else if (typeof object.src_channel_id === "object")
                            message.src_channel_id = new $util.LongBits(object.src_channel_id.low >>> 0, object.src_channel_id.high >>> 0).toNumber();
                    if (object.display_role_id) {
                        if (!Array.isArray(object.display_role_id))
                            throw TypeError(".Protocols.Protobuf.PBClass.MessageInfo.display_role_id: array expected");
                        message.display_role_id = [];
                        for (let i = 0; i < object.display_role_id.length; ++i)
                            if ($util.Long)
                                (message.display_role_id[i] = $util.Long.fromValue(object.display_role_id[i])).unsigned = false;
                            else if (typeof object.display_role_id[i] === "string")
                                message.display_role_id[i] = parseInt(object.display_role_id[i], 10);
                            else if (typeof object.display_role_id[i] === "number")
                                message.display_role_id[i] = object.display_role_id[i];
                            else if (typeof object.display_role_id[i] === "object")
                                message.display_role_id[i] = new $util.LongBits(object.display_role_id[i].low >>> 0, object.display_role_id[i].high >>> 0).toNumber();
                    }
                    if (object.src_message_id != null)
                        if ($util.Long)
                            (message.src_message_id = $util.Long.fromValue(object.src_message_id)).unsigned = false;
                        else if (typeof object.src_message_id === "string")
                            message.src_message_id = parseInt(object.src_message_id, 10);
                        else if (typeof object.src_message_id === "number")
                            message.src_message_id = object.src_message_id;
                        else if (typeof object.src_message_id === "object")
                            message.src_message_id = new $util.LongBits(object.src_message_id.low >>> 0, object.src_message_id.high >>> 0).toNumber();
                    return message;
                };

                /**
                 * Creates a plain object from a MessageInfo message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.MessageInfo} message MessageInfo
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MessageInfo.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.mentions = [];
                        object.mention_roles = [];
                        object.display_role_id = [];
                    }
                    if (options.defaults) {
                        object.m_type = options.enums === String ? "NORMAL" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.message_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.message_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.user_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.user_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.operation_message_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.operation_message_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.post_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.post_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.comment_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.comment_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.quote_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.quote_id = options.longs === String ? "0" : 0;
                        object.circle_type = "";
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.channel_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.guild_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.guild_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.src_channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.src_channel_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.src_message_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.src_message_id = options.longs === String ? "0" : 0;
                    }
                    if (message.m_type != null && message.hasOwnProperty("m_type"))
                        object.m_type = options.enums === String ? $root.Protocols.Protobuf.PBClass.MessageType[message.m_type] === undefined ? message.m_type : $root.Protocols.Protobuf.PBClass.MessageType[message.m_type] : message.m_type;
                    if (message.message_id != null && message.hasOwnProperty("message_id"))
                        if (typeof message.message_id === "number")
                            object.message_id = options.longs === String ? String(message.message_id) : message.message_id;
                        else
                            object.message_id = options.longs === String ? $util.Long.prototype.toString.call(message.message_id) : options.longs === Number ? new $util.LongBits(message.message_id.low >>> 0, message.message_id.high >>> 0).toNumber() : message.message_id;
                    if (message.user_id != null && message.hasOwnProperty("user_id"))
                        if (typeof message.user_id === "number")
                            object.user_id = options.longs === String ? String(message.user_id) : message.user_id;
                        else
                            object.user_id = options.longs === String ? $util.Long.prototype.toString.call(message.user_id) : options.longs === Number ? new $util.LongBits(message.user_id.low >>> 0, message.user_id.high >>> 0).toNumber() : message.user_id;
                    if (message.operation_message_id != null && message.hasOwnProperty("operation_message_id"))
                        if (typeof message.operation_message_id === "number")
                            object.operation_message_id = options.longs === String ? String(message.operation_message_id) : message.operation_message_id;
                        else
                            object.operation_message_id = options.longs === String ? $util.Long.prototype.toString.call(message.operation_message_id) : options.longs === Number ? new $util.LongBits(message.operation_message_id.low >>> 0, message.operation_message_id.high >>> 0).toNumber() : message.operation_message_id;
                    if (message.mentions && message.mentions.length) {
                        object.mentions = [];
                        for (let j = 0; j < message.mentions.length; ++j)
                            if (typeof message.mentions[j] === "number")
                                object.mentions[j] = options.longs === String ? String(message.mentions[j]) : message.mentions[j];
                            else
                                object.mentions[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mentions[j]) : options.longs === Number ? new $util.LongBits(message.mentions[j].low >>> 0, message.mentions[j].high >>> 0).toNumber() : message.mentions[j];
                    }
                    if (message.mention_roles && message.mention_roles.length) {
                        object.mention_roles = [];
                        for (let j = 0; j < message.mention_roles.length; ++j)
                            if (typeof message.mention_roles[j] === "number")
                                object.mention_roles[j] = options.longs === String ? String(message.mention_roles[j]) : message.mention_roles[j];
                            else
                                object.mention_roles[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mention_roles[j]) : options.longs === Number ? new $util.LongBits(message.mention_roles[j].low >>> 0, message.mention_roles[j].high >>> 0).toNumber() : message.mention_roles[j];
                    }
                    if (message.post_id != null && message.hasOwnProperty("post_id"))
                        if (typeof message.post_id === "number")
                            object.post_id = options.longs === String ? String(message.post_id) : message.post_id;
                        else
                            object.post_id = options.longs === String ? $util.Long.prototype.toString.call(message.post_id) : options.longs === Number ? new $util.LongBits(message.post_id.low >>> 0, message.post_id.high >>> 0).toNumber() : message.post_id;
                    if (message.comment_id != null && message.hasOwnProperty("comment_id"))
                        if (typeof message.comment_id === "number")
                            object.comment_id = options.longs === String ? String(message.comment_id) : message.comment_id;
                        else
                            object.comment_id = options.longs === String ? $util.Long.prototype.toString.call(message.comment_id) : options.longs === Number ? new $util.LongBits(message.comment_id.low >>> 0, message.comment_id.high >>> 0).toNumber() : message.comment_id;
                    if (message.quote_id != null && message.hasOwnProperty("quote_id"))
                        if (typeof message.quote_id === "number")
                            object.quote_id = options.longs === String ? String(message.quote_id) : message.quote_id;
                        else
                            object.quote_id = options.longs === String ? $util.Long.prototype.toString.call(message.quote_id) : options.longs === Number ? new $util.LongBits(message.quote_id.low >>> 0, message.quote_id.high >>> 0).toNumber() : message.quote_id;
                    if (message.circle_type != null && message.hasOwnProperty("circle_type"))
                        object.circle_type = message.circle_type;
                    if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                        if (typeof message.channel_id === "number")
                            object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                        else
                            object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                    if (message.guild_id != null && message.hasOwnProperty("guild_id"))
                        if (typeof message.guild_id === "number")
                            object.guild_id = options.longs === String ? String(message.guild_id) : message.guild_id;
                        else
                            object.guild_id = options.longs === String ? $util.Long.prototype.toString.call(message.guild_id) : options.longs === Number ? new $util.LongBits(message.guild_id.low >>> 0, message.guild_id.high >>> 0).toNumber() : message.guild_id;
                    if (message.src_channel_id != null && message.hasOwnProperty("src_channel_id"))
                        if (typeof message.src_channel_id === "number")
                            object.src_channel_id = options.longs === String ? String(message.src_channel_id) : message.src_channel_id;
                        else
                            object.src_channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.src_channel_id) : options.longs === Number ? new $util.LongBits(message.src_channel_id.low >>> 0, message.src_channel_id.high >>> 0).toNumber() : message.src_channel_id;
                    if (message.display_role_id && message.display_role_id.length) {
                        object.display_role_id = [];
                        for (let j = 0; j < message.display_role_id.length; ++j)
                            if (typeof message.display_role_id[j] === "number")
                                object.display_role_id[j] = options.longs === String ? String(message.display_role_id[j]) : message.display_role_id[j];
                            else
                                object.display_role_id[j] = options.longs === String ? $util.Long.prototype.toString.call(message.display_role_id[j]) : options.longs === Number ? new $util.LongBits(message.display_role_id[j].low >>> 0, message.display_role_id[j].high >>> 0).toNumber() : message.display_role_id[j];
                    }
                    if (message.src_message_id != null && message.hasOwnProperty("src_message_id"))
                        if (typeof message.src_message_id === "number")
                            object.src_message_id = options.longs === String ? String(message.src_message_id) : message.src_message_id;
                        else
                            object.src_message_id = options.longs === String ? $util.Long.prototype.toString.call(message.src_message_id) : options.longs === Number ? new $util.LongBits(message.src_message_id.low >>> 0, message.src_message_id.high >>> 0).toNumber() : message.src_message_id;
                    return object;
                };

                /**
                 * Converts this MessageInfo to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MessageInfo.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MessageInfo
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.MessageInfo
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MessageInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.MessageInfo";
                };

                return MessageInfo;
            })();

            PBClass.ReactionInfo = (function() {

                /**
                 * Properties of a ReactionInfo.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IReactionInfo
                 * @property {Object.<string,number>|null} [emojis] ReactionInfo emojis
                 */

                /**
                 * Constructs a new ReactionInfo.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a ReactionInfo.
                 * @implements IReactionInfo
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IReactionInfo=} [properties] Properties to set
                 */
                function ReactionInfo(properties) {
                    this.emojis = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ReactionInfo emojis.
                 * @member {Object.<string,number>} emojis
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @instance
                 */
                ReactionInfo.prototype.emojis = $util.emptyObject;

                /**
                 * Creates a new ReactionInfo instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReactionInfo=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.ReactionInfo} ReactionInfo instance
                 */
                ReactionInfo.create = function create(properties) {
                    return new ReactionInfo(properties);
                };

                /**
                 * Encodes the specified ReactionInfo message. Does not implicitly {@link Protocols.Protobuf.PBClass.ReactionInfo.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReactionInfo} message ReactionInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReactionInfo.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.emojis != null && Object.hasOwnProperty.call(message, "emojis"))
                        for (let keys = Object.keys(message.emojis), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 0 =*/16).int32(message.emojis[keys[i]]).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ReactionInfo message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.ReactionInfo.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReactionInfo} message ReactionInfo message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReactionInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ReactionInfo message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.ReactionInfo} ReactionInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReactionInfo.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.ReactionInfo(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                if (message.emojis === $util.emptyObject)
                                    message.emojis = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = 0;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.int32();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.emojis[key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ReactionInfo message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.ReactionInfo} ReactionInfo
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReactionInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ReactionInfo message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ReactionInfo.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.emojis != null && message.hasOwnProperty("emojis")) {
                        if (!$util.isObject(message.emojis))
                            return "emojis: object expected";
                        let key = Object.keys(message.emojis);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isInteger(message.emojis[key[i]]))
                                return "emojis: integer{k:string} expected";
                    }
                    return null;
                };

                /**
                 * Creates a ReactionInfo message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.ReactionInfo} ReactionInfo
                 */
                ReactionInfo.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.ReactionInfo)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.ReactionInfo();
                    if (object.emojis) {
                        if (typeof object.emojis !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.ReactionInfo.emojis: object expected");
                        message.emojis = {};
                        for (let keys = Object.keys(object.emojis), i = 0; i < keys.length; ++i)
                            message.emojis[keys[i]] = object.emojis[keys[i]] | 0;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ReactionInfo message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {Protocols.Protobuf.PBClass.ReactionInfo} message ReactionInfo
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ReactionInfo.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.objects || options.defaults)
                        object.emojis = {};
                    let keys2;
                    if (message.emojis && (keys2 = Object.keys(message.emojis)).length) {
                        object.emojis = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.emojis[keys2[j]] = message.emojis[keys2[j]];
                    }
                    return object;
                };

                /**
                 * Converts this ReactionInfo to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ReactionInfo.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ReactionInfo
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.ReactionInfo
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ReactionInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.ReactionInfo";
                };

                return ReactionInfo;
            })();

            PBClass.ReadChannelList = (function() {

                /**
                 * Properties of a ReadChannelList.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IReadChannelList
                 * @property {Object.<string,number>|null} [channel_read_list] ReadChannelList channel_read_list
                 */

                /**
                 * Constructs a new ReadChannelList.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a ReadChannelList.
                 * @implements IReadChannelList
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IReadChannelList=} [properties] Properties to set
                 */
                function ReadChannelList(properties) {
                    this.channel_read_list = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ReadChannelList channel_read_list.
                 * @member {Object.<string,number>} channel_read_list
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @instance
                 */
                ReadChannelList.prototype.channel_read_list = $util.emptyObject;

                /**
                 * Creates a new ReadChannelList instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReadChannelList=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.ReadChannelList} ReadChannelList instance
                 */
                ReadChannelList.create = function create(properties) {
                    return new ReadChannelList(properties);
                };

                /**
                 * Encodes the specified ReadChannelList message. Does not implicitly {@link Protocols.Protobuf.PBClass.ReadChannelList.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReadChannelList} message ReadChannelList message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReadChannelList.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.channel_read_list != null && Object.hasOwnProperty.call(message, "channel_read_list"))
                        for (let keys = Object.keys(message.channel_read_list), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 1 =*/17).fixed64(message.channel_read_list[keys[i]]).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ReadChannelList message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.ReadChannelList.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IReadChannelList} message ReadChannelList message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReadChannelList.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ReadChannelList message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.ReadChannelList} ReadChannelList
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReadChannelList.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.ReadChannelList(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                if (message.channel_read_list === $util.emptyObject)
                                    message.channel_read_list = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = 0;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.fixed64();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.channel_read_list[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ReadChannelList message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.ReadChannelList} ReadChannelList
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReadChannelList.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ReadChannelList message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ReadChannelList.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.channel_read_list != null && message.hasOwnProperty("channel_read_list")) {
                        if (!$util.isObject(message.channel_read_list))
                            return "channel_read_list: object expected";
                        let key = Object.keys(message.channel_read_list);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "channel_read_list: integer|Long key{k:fixed64} expected";
                            if (!$util.isInteger(message.channel_read_list[key[i]]) && !(message.channel_read_list[key[i]] && $util.isInteger(message.channel_read_list[key[i]].low) && $util.isInteger(message.channel_read_list[key[i]].high)))
                                return "channel_read_list: integer|Long{k:fixed64} expected";
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ReadChannelList message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.ReadChannelList} ReadChannelList
                 */
                ReadChannelList.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.ReadChannelList)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.ReadChannelList();
                    if (object.channel_read_list) {
                        if (typeof object.channel_read_list !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.ReadChannelList.channel_read_list: object expected");
                        message.channel_read_list = {};
                        for (let keys = Object.keys(object.channel_read_list), i = 0; i < keys.length; ++i)
                            if ($util.Long)
                                (message.channel_read_list[keys[i]] = $util.Long.fromValue(object.channel_read_list[keys[i]])).unsigned = false;
                            else if (typeof object.channel_read_list[keys[i]] === "string")
                                message.channel_read_list[keys[i]] = parseInt(object.channel_read_list[keys[i]], 10);
                            else if (typeof object.channel_read_list[keys[i]] === "number")
                                message.channel_read_list[keys[i]] = object.channel_read_list[keys[i]];
                            else if (typeof object.channel_read_list[keys[i]] === "object")
                                message.channel_read_list[keys[i]] = new $util.LongBits(object.channel_read_list[keys[i]].low >>> 0, object.channel_read_list[keys[i]].high >>> 0).toNumber();
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ReadChannelList message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {Protocols.Protobuf.PBClass.ReadChannelList} message ReadChannelList
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ReadChannelList.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.objects || options.defaults)
                        object.channel_read_list = {};
                    let keys2;
                    if (message.channel_read_list && (keys2 = Object.keys(message.channel_read_list)).length) {
                        object.channel_read_list = {};
                        for (let j = 0; j < keys2.length; ++j)
                            if (typeof message.channel_read_list[keys2[j]] === "number")
                                object.channel_read_list[keys2[j]] = options.longs === String ? String(message.channel_read_list[keys2[j]]) : message.channel_read_list[keys2[j]];
                            else
                                object.channel_read_list[keys2[j]] = options.longs === String ? $util.Long.prototype.toString.call(message.channel_read_list[keys2[j]]) : options.longs === Number ? new $util.LongBits(message.channel_read_list[keys2[j]].low >>> 0, message.channel_read_list[keys2[j]].high >>> 0).toNumber() : message.channel_read_list[keys2[j]];
                    }
                    return object;
                };

                /**
                 * Converts this ReadChannelList to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ReadChannelList.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ReadChannelList
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.ReadChannelList
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ReadChannelList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.ReadChannelList";
                };

                return ReadChannelList;
            })();

            PBClass.ChannelMessageData = (function() {

                /**
                 * Properties of a ChannelMessageData.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IChannelMessageData
                 * @property {Array.<Uint8Array>|null} [entity] ChannelMessageData entity
                 * @property {Array.<Uint8Array>|null} [no_entity] ChannelMessageData no_entity
                 * @property {Array.<Uint8Array>|null} [at] ChannelMessageData at
                 */

                /**
                 * Constructs a new ChannelMessageData.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a ChannelMessageData.
                 * @implements IChannelMessageData
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IChannelMessageData=} [properties] Properties to set
                 */
                function ChannelMessageData(properties) {
                    this.entity = [];
                    this.no_entity = [];
                    this.at = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ChannelMessageData entity.
                 * @member {Array.<Uint8Array>} entity
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @instance
                 */
                ChannelMessageData.prototype.entity = $util.emptyArray;

                /**
                 * ChannelMessageData no_entity.
                 * @member {Array.<Uint8Array>} no_entity
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @instance
                 */
                ChannelMessageData.prototype.no_entity = $util.emptyArray;

                /**
                 * ChannelMessageData at.
                 * @member {Array.<Uint8Array>} at
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @instance
                 */
                ChannelMessageData.prototype.at = $util.emptyArray;

                /**
                 * Creates a new ChannelMessageData instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelMessageData=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.ChannelMessageData} ChannelMessageData instance
                 */
                ChannelMessageData.create = function create(properties) {
                    return new ChannelMessageData(properties);
                };

                /**
                 * Encodes the specified ChannelMessageData message. Does not implicitly {@link Protocols.Protobuf.PBClass.ChannelMessageData.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelMessageData} message ChannelMessageData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChannelMessageData.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.entity != null && message.entity.length)
                        for (let i = 0; i < message.entity.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.entity[i]);
                    if (message.no_entity != null && message.no_entity.length)
                        for (let i = 0; i < message.no_entity.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.no_entity[i]);
                    if (message.at != null && message.at.length)
                        for (let i = 0; i < message.at.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.at[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ChannelMessageData message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.ChannelMessageData.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IChannelMessageData} message ChannelMessageData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChannelMessageData.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ChannelMessageData message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.ChannelMessageData} ChannelMessageData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChannelMessageData.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.ChannelMessageData();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.entity && message.entity.length))
                                    message.entity = [];
                                message.entity.push(reader.bytes());
                                break;
                            }
                        case 2: {
                                if (!(message.no_entity && message.no_entity.length))
                                    message.no_entity = [];
                                message.no_entity.push(reader.bytes());
                                break;
                            }
                        case 3: {
                                if (!(message.at && message.at.length))
                                    message.at = [];
                                message.at.push(reader.bytes());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ChannelMessageData message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.ChannelMessageData} ChannelMessageData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChannelMessageData.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ChannelMessageData message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ChannelMessageData.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.entity != null && message.hasOwnProperty("entity")) {
                        if (!Array.isArray(message.entity))
                            return "entity: array expected";
                        for (let i = 0; i < message.entity.length; ++i)
                            if (!(message.entity[i] && typeof message.entity[i].length === "number" || $util.isString(message.entity[i])))
                                return "entity: buffer[] expected";
                    }
                    if (message.no_entity != null && message.hasOwnProperty("no_entity")) {
                        if (!Array.isArray(message.no_entity))
                            return "no_entity: array expected";
                        for (let i = 0; i < message.no_entity.length; ++i)
                            if (!(message.no_entity[i] && typeof message.no_entity[i].length === "number" || $util.isString(message.no_entity[i])))
                                return "no_entity: buffer[] expected";
                    }
                    if (message.at != null && message.hasOwnProperty("at")) {
                        if (!Array.isArray(message.at))
                            return "at: array expected";
                        for (let i = 0; i < message.at.length; ++i)
                            if (!(message.at[i] && typeof message.at[i].length === "number" || $util.isString(message.at[i])))
                                return "at: buffer[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a ChannelMessageData message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.ChannelMessageData} ChannelMessageData
                 */
                ChannelMessageData.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.ChannelMessageData)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.ChannelMessageData();
                    if (object.entity) {
                        if (!Array.isArray(object.entity))
                            throw TypeError(".Protocols.Protobuf.PBClass.ChannelMessageData.entity: array expected");
                        message.entity = [];
                        for (let i = 0; i < object.entity.length; ++i)
                            if (typeof object.entity[i] === "string")
                                $util.base64.decode(object.entity[i], message.entity[i] = $util.newBuffer($util.base64.length(object.entity[i])), 0);
                            else if (object.entity[i].length >= 0)
                                message.entity[i] = object.entity[i];
                    }
                    if (object.no_entity) {
                        if (!Array.isArray(object.no_entity))
                            throw TypeError(".Protocols.Protobuf.PBClass.ChannelMessageData.no_entity: array expected");
                        message.no_entity = [];
                        for (let i = 0; i < object.no_entity.length; ++i)
                            if (typeof object.no_entity[i] === "string")
                                $util.base64.decode(object.no_entity[i], message.no_entity[i] = $util.newBuffer($util.base64.length(object.no_entity[i])), 0);
                            else if (object.no_entity[i].length >= 0)
                                message.no_entity[i] = object.no_entity[i];
                    }
                    if (object.at) {
                        if (!Array.isArray(object.at))
                            throw TypeError(".Protocols.Protobuf.PBClass.ChannelMessageData.at: array expected");
                        message.at = [];
                        for (let i = 0; i < object.at.length; ++i)
                            if (typeof object.at[i] === "string")
                                $util.base64.decode(object.at[i], message.at[i] = $util.newBuffer($util.base64.length(object.at[i])), 0);
                            else if (object.at[i].length >= 0)
                                message.at[i] = object.at[i];
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ChannelMessageData message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {Protocols.Protobuf.PBClass.ChannelMessageData} message ChannelMessageData
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ChannelMessageData.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.entity = [];
                        object.no_entity = [];
                        object.at = [];
                    }
                    if (message.entity && message.entity.length) {
                        object.entity = [];
                        for (let j = 0; j < message.entity.length; ++j)
                            object.entity[j] = options.bytes === String ? $util.base64.encode(message.entity[j], 0, message.entity[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.entity[j]) : message.entity[j];
                    }
                    if (message.no_entity && message.no_entity.length) {
                        object.no_entity = [];
                        for (let j = 0; j < message.no_entity.length; ++j)
                            object.no_entity[j] = options.bytes === String ? $util.base64.encode(message.no_entity[j], 0, message.no_entity[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.no_entity[j]) : message.no_entity[j];
                    }
                    if (message.at && message.at.length) {
                        object.at = [];
                        for (let j = 0; j < message.at.length; ++j)
                            object.at[j] = options.bytes === String ? $util.base64.encode(message.at[j], 0, message.at[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.at[j]) : message.at[j];
                    }
                    return object;
                };

                /**
                 * Converts this ChannelMessageData to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ChannelMessageData.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ChannelMessageData
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.ChannelMessageData
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ChannelMessageData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.ChannelMessageData";
                };

                return ChannelMessageData;
            })();

            PBClass.PullMessage = (function() {

                /**
                 * Properties of a PullMessage.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IPullMessage
                 * @property {number|null} [ack] PullMessage ack
                 * @property {number|null} [t] PullMessage t
                 * @property {number|null} [pull_time] PullMessage pull_time
                 * @property {Array.<number>|null} [no_display] PullMessage no_display
                 * @property {Object.<string,string>|null} [descs] PullMessage descs
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IChannelMessageData>|null} [channel_data] PullMessage channel_data
                 * @property {number|null} [seq] PullMessage seq
                 * @property {number|null} [clean] PullMessage clean
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IReactionInfo>|null} [reactions] PullMessage reactions
                 * @property {Object.<string,number>|null} [up_last] PullMessage up_last
                 * @property {Object.<string,Protocols.Protobuf.PBClass.IReadChannelList>|null} [read_lists] PullMessage read_lists
                 * @property {Object.<string,Protocols.Protobuf.PBClass.Idesc>|null} [desc_text] PullMessage desc_text
                 * @property {number|null} [notpull_threshold] PullMessage notpull_threshold
                 * @property {Object.<string,Uint8Array>|null} [first_message] PullMessage first_message
                 */

                /**
                 * Constructs a new PullMessage.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a PullMessage.
                 * @implements IPullMessage
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IPullMessage=} [properties] Properties to set
                 */
                function PullMessage(properties) {
                    this.no_display = [];
                    this.descs = {};
                    this.channel_data = {};
                    this.reactions = {};
                    this.up_last = {};
                    this.read_lists = {};
                    this.desc_text = {};
                    this.first_message = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * PullMessage ack.
                 * @member {number} ack
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.ack = 0;

                /**
                 * PullMessage t.
                 * @member {number} t
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.t = 0;

                /**
                 * PullMessage pull_time.
                 * @member {number} pull_time
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.pull_time = 0;

                /**
                 * PullMessage no_display.
                 * @member {Array.<number>} no_display
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.no_display = $util.emptyArray;

                /**
                 * PullMessage descs.
                 * @member {Object.<string,string>} descs
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.descs = $util.emptyObject;

                /**
                 * PullMessage channel_data.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IChannelMessageData>} channel_data
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.channel_data = $util.emptyObject;

                /**
                 * PullMessage seq.
                 * @member {number} seq
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.seq = 0;

                /**
                 * PullMessage clean.
                 * @member {number} clean
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.clean = 0;

                /**
                 * PullMessage reactions.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IReactionInfo>} reactions
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.reactions = $util.emptyObject;

                /**
                 * PullMessage up_last.
                 * @member {Object.<string,number>} up_last
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.up_last = $util.emptyObject;

                /**
                 * PullMessage read_lists.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.IReadChannelList>} read_lists
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.read_lists = $util.emptyObject;

                /**
                 * PullMessage desc_text.
                 * @member {Object.<string,Protocols.Protobuf.PBClass.Idesc>} desc_text
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.desc_text = $util.emptyObject;

                /**
                 * PullMessage notpull_threshold.
                 * @member {number} notpull_threshold
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.notpull_threshold = 0;

                /**
                 * PullMessage first_message.
                 * @member {Object.<string,Uint8Array>} first_message
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 */
                PullMessage.prototype.first_message = $util.emptyObject;

                /**
                 * Creates a new PullMessage instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPullMessage=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.PullMessage} PullMessage instance
                 */
                PullMessage.create = function create(properties) {
                    return new PullMessage(properties);
                };

                /**
                 * Encodes the specified PullMessage message. Does not implicitly {@link Protocols.Protobuf.PBClass.PullMessage.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPullMessage} message PullMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PullMessage.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.ack != null && Object.hasOwnProperty.call(message, "ack"))
                        writer.uint32(/* id 1, wireType 5 =*/13).fixed32(message.ack);
                    if (message.t != null && Object.hasOwnProperty.call(message, "t"))
                        writer.uint32(/* id 2, wireType 5 =*/21).fixed32(message.t);
                    if (message.pull_time != null && Object.hasOwnProperty.call(message, "pull_time"))
                        writer.uint32(/* id 3, wireType 5 =*/29).fixed32(message.pull_time);
                    if (message.no_display != null && message.no_display.length) {
                        writer.uint32(/* id 5, wireType 2 =*/42).fork();
                        for (let i = 0; i < message.no_display.length; ++i)
                            writer.fixed64(message.no_display[i]);
                        writer.ldelim();
                    }
                    if (message.descs != null && Object.hasOwnProperty.call(message, "descs"))
                        for (let keys = Object.keys(message.descs), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.descs[keys[i]]).ldelim();
                    if (message.channel_data != null && Object.hasOwnProperty.call(message, "channel_data"))
                        for (let keys = Object.keys(message.channel_data), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 7, wireType 2 =*/58).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ChannelMessageData.encode(message.channel_data[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.seq != null && Object.hasOwnProperty.call(message, "seq"))
                        writer.uint32(/* id 8, wireType 5 =*/69).fixed32(message.seq);
                    if (message.clean != null && Object.hasOwnProperty.call(message, "clean"))
                        writer.uint32(/* id 9, wireType 0 =*/72).int32(message.clean);
                    if (message.reactions != null && Object.hasOwnProperty.call(message, "reactions"))
                        for (let keys = Object.keys(message.reactions), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 10, wireType 2 =*/82).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ReactionInfo.encode(message.reactions[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.up_last != null && Object.hasOwnProperty.call(message, "up_last"))
                        for (let keys = Object.keys(message.up_last), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 1 =*/17).fixed64(message.up_last[keys[i]]).ldelim();
                    if (message.read_lists != null && Object.hasOwnProperty.call(message, "read_lists"))
                        for (let keys = Object.keys(message.read_lists), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 12, wireType 2 =*/98).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.ReadChannelList.encode(message.read_lists[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.desc_text != null && Object.hasOwnProperty.call(message, "desc_text"))
                        for (let keys = Object.keys(message.desc_text), i = 0; i < keys.length; ++i) {
                            writer.uint32(/* id 13, wireType 2 =*/106).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]);
                            $root.Protocols.Protobuf.PBClass.desc.encode(message.desc_text[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                        }
                    if (message.notpull_threshold != null && Object.hasOwnProperty.call(message, "notpull_threshold"))
                        writer.uint32(/* id 14, wireType 5 =*/117).fixed32(message.notpull_threshold);
                    if (message.first_message != null && Object.hasOwnProperty.call(message, "first_message"))
                        for (let keys = Object.keys(message.first_message), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 15, wireType 2 =*/122).fork().uint32(/* id 1, wireType 1 =*/9).fixed64(keys[i]).uint32(/* id 2, wireType 2 =*/18).bytes(message.first_message[keys[i]]).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified PullMessage message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.PullMessage.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPullMessage} message PullMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PullMessage.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a PullMessage message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.PullMessage} PullMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PullMessage.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.PullMessage(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.ack = reader.fixed32();
                                break;
                            }
                        case 2: {
                                message.t = reader.fixed32();
                                break;
                            }
                        case 3: {
                                message.pull_time = reader.fixed32();
                                break;
                            }
                        case 5: {
                                if (!(message.no_display && message.no_display.length))
                                    message.no_display = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.no_display.push(reader.fixed64());
                                } else
                                    message.no_display.push(reader.fixed64());
                                break;
                            }
                        case 6: {
                                if (message.descs === $util.emptyObject)
                                    message.descs = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.descs[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 7: {
                                if (message.channel_data === $util.emptyObject)
                                    message.channel_data = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ChannelMessageData.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.channel_data[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 8: {
                                message.seq = reader.fixed32();
                                break;
                            }
                        case 9: {
                                message.clean = reader.int32();
                                break;
                            }
                        case 10: {
                                if (message.reactions === $util.emptyObject)
                                    message.reactions = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ReactionInfo.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.reactions[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 11: {
                                if (message.up_last === $util.emptyObject)
                                    message.up_last = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = 0;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.fixed64();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.up_last[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 12: {
                                if (message.read_lists === $util.emptyObject)
                                    message.read_lists = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.ReadChannelList.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.read_lists[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 13: {
                                if (message.desc_text === $util.emptyObject)
                                    message.desc_text = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = null;
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = $root.Protocols.Protobuf.PBClass.desc.decode(reader, reader.uint32());
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.desc_text[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        case 14: {
                                message.notpull_threshold = reader.fixed32();
                                break;
                            }
                        case 15: {
                                if (message.first_message === $util.emptyObject)
                                    message.first_message = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = 0;
                                value = [];
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.fixed64();
                                        break;
                                    case 2:
                                        value = reader.bytes();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.first_message[typeof key === "object" ? $util.longToHash(key) : key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a PullMessage message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.PullMessage} PullMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PullMessage.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a PullMessage message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                PullMessage.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.ack != null && message.hasOwnProperty("ack"))
                        if (!$util.isInteger(message.ack))
                            return "ack: integer expected";
                    if (message.t != null && message.hasOwnProperty("t"))
                        if (!$util.isInteger(message.t))
                            return "t: integer expected";
                    if (message.pull_time != null && message.hasOwnProperty("pull_time"))
                        if (!$util.isInteger(message.pull_time))
                            return "pull_time: integer expected";
                    if (message.no_display != null && message.hasOwnProperty("no_display")) {
                        if (!Array.isArray(message.no_display))
                            return "no_display: array expected";
                        for (let i = 0; i < message.no_display.length; ++i)
                            if (!$util.isInteger(message.no_display[i]) && !(message.no_display[i] && $util.isInteger(message.no_display[i].low) && $util.isInteger(message.no_display[i].high)))
                                return "no_display: integer|Long[] expected";
                    }
                    if (message.descs != null && message.hasOwnProperty("descs")) {
                        if (!$util.isObject(message.descs))
                            return "descs: object expected";
                        let key = Object.keys(message.descs);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "descs: integer|Long key{k:fixed64} expected";
                            if (!$util.isString(message.descs[key[i]]))
                                return "descs: string{k:fixed64} expected";
                        }
                    }
                    if (message.channel_data != null && message.hasOwnProperty("channel_data")) {
                        if (!$util.isObject(message.channel_data))
                            return "channel_data: object expected";
                        let key = Object.keys(message.channel_data);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "channel_data: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ChannelMessageData.verify(message.channel_data[key[i]]);
                                if (error)
                                    return "channel_data." + error;
                            }
                        }
                    }
                    if (message.seq != null && message.hasOwnProperty("seq"))
                        if (!$util.isInteger(message.seq))
                            return "seq: integer expected";
                    if (message.clean != null && message.hasOwnProperty("clean"))
                        if (!$util.isInteger(message.clean))
                            return "clean: integer expected";
                    if (message.reactions != null && message.hasOwnProperty("reactions")) {
                        if (!$util.isObject(message.reactions))
                            return "reactions: object expected";
                        let key = Object.keys(message.reactions);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "reactions: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ReactionInfo.verify(message.reactions[key[i]]);
                                if (error)
                                    return "reactions." + error;
                            }
                        }
                    }
                    if (message.up_last != null && message.hasOwnProperty("up_last")) {
                        if (!$util.isObject(message.up_last))
                            return "up_last: object expected";
                        let key = Object.keys(message.up_last);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "up_last: integer|Long key{k:fixed64} expected";
                            if (!$util.isInteger(message.up_last[key[i]]) && !(message.up_last[key[i]] && $util.isInteger(message.up_last[key[i]].low) && $util.isInteger(message.up_last[key[i]].high)))
                                return "up_last: integer|Long{k:fixed64} expected";
                        }
                    }
                    if (message.read_lists != null && message.hasOwnProperty("read_lists")) {
                        if (!$util.isObject(message.read_lists))
                            return "read_lists: object expected";
                        let key = Object.keys(message.read_lists);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "read_lists: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.ReadChannelList.verify(message.read_lists[key[i]]);
                                if (error)
                                    return "read_lists." + error;
                            }
                        }
                    }
                    if (message.desc_text != null && message.hasOwnProperty("desc_text")) {
                        if (!$util.isObject(message.desc_text))
                            return "desc_text: object expected";
                        let key = Object.keys(message.desc_text);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "desc_text: integer|Long key{k:fixed64} expected";
                            {
                                let error = $root.Protocols.Protobuf.PBClass.desc.verify(message.desc_text[key[i]]);
                                if (error)
                                    return "desc_text." + error;
                            }
                        }
                    }
                    if (message.notpull_threshold != null && message.hasOwnProperty("notpull_threshold"))
                        if (!$util.isInteger(message.notpull_threshold))
                            return "notpull_threshold: integer expected";
                    if (message.first_message != null && message.hasOwnProperty("first_message")) {
                        if (!$util.isObject(message.first_message))
                            return "first_message: object expected";
                        let key = Object.keys(message.first_message);
                        for (let i = 0; i < key.length; ++i) {
                            if (!$util.key64Re.test(key[i]))
                                return "first_message: integer|Long key{k:fixed64} expected";
                            if (!(message.first_message[key[i]] && typeof message.first_message[key[i]].length === "number" || $util.isString(message.first_message[key[i]])))
                                return "first_message: buffer{k:fixed64} expected";
                        }
                    }
                    return null;
                };

                /**
                 * Creates a PullMessage message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.PullMessage} PullMessage
                 */
                PullMessage.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.PullMessage)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.PullMessage();
                    if (object.ack != null)
                        message.ack = object.ack >>> 0;
                    if (object.t != null)
                        message.t = object.t >>> 0;
                    if (object.pull_time != null)
                        message.pull_time = object.pull_time >>> 0;
                    if (object.no_display) {
                        if (!Array.isArray(object.no_display))
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.no_display: array expected");
                        message.no_display = [];
                        for (let i = 0; i < object.no_display.length; ++i)
                            if ($util.Long)
                                (message.no_display[i] = $util.Long.fromValue(object.no_display[i])).unsigned = false;
                            else if (typeof object.no_display[i] === "string")
                                message.no_display[i] = parseInt(object.no_display[i], 10);
                            else if (typeof object.no_display[i] === "number")
                                message.no_display[i] = object.no_display[i];
                            else if (typeof object.no_display[i] === "object")
                                message.no_display[i] = new $util.LongBits(object.no_display[i].low >>> 0, object.no_display[i].high >>> 0).toNumber();
                    }
                    if (object.descs) {
                        if (typeof object.descs !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.descs: object expected");
                        message.descs = {};
                        for (let keys = Object.keys(object.descs), i = 0; i < keys.length; ++i)
                            message.descs[keys[i]] = String(object.descs[keys[i]]);
                    }
                    if (object.channel_data) {
                        if (typeof object.channel_data !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.channel_data: object expected");
                        message.channel_data = {};
                        for (let keys = Object.keys(object.channel_data), i = 0; i < keys.length; ++i) {
                            if (typeof object.channel_data[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.channel_data: object expected");
                            message.channel_data[keys[i]] = $root.Protocols.Protobuf.PBClass.ChannelMessageData.fromObject(object.channel_data[keys[i]]);
                        }
                    }
                    if (object.seq != null)
                        message.seq = object.seq >>> 0;
                    if (object.clean != null)
                        message.clean = object.clean | 0;
                    if (object.reactions) {
                        if (typeof object.reactions !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.reactions: object expected");
                        message.reactions = {};
                        for (let keys = Object.keys(object.reactions), i = 0; i < keys.length; ++i) {
                            if (typeof object.reactions[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.reactions: object expected");
                            message.reactions[keys[i]] = $root.Protocols.Protobuf.PBClass.ReactionInfo.fromObject(object.reactions[keys[i]]);
                        }
                    }
                    if (object.up_last) {
                        if (typeof object.up_last !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.up_last: object expected");
                        message.up_last = {};
                        for (let keys = Object.keys(object.up_last), i = 0; i < keys.length; ++i)
                            if ($util.Long)
                                (message.up_last[keys[i]] = $util.Long.fromValue(object.up_last[keys[i]])).unsigned = false;
                            else if (typeof object.up_last[keys[i]] === "string")
                                message.up_last[keys[i]] = parseInt(object.up_last[keys[i]], 10);
                            else if (typeof object.up_last[keys[i]] === "number")
                                message.up_last[keys[i]] = object.up_last[keys[i]];
                            else if (typeof object.up_last[keys[i]] === "object")
                                message.up_last[keys[i]] = new $util.LongBits(object.up_last[keys[i]].low >>> 0, object.up_last[keys[i]].high >>> 0).toNumber();
                    }
                    if (object.read_lists) {
                        if (typeof object.read_lists !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.read_lists: object expected");
                        message.read_lists = {};
                        for (let keys = Object.keys(object.read_lists), i = 0; i < keys.length; ++i) {
                            if (typeof object.read_lists[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.read_lists: object expected");
                            message.read_lists[keys[i]] = $root.Protocols.Protobuf.PBClass.ReadChannelList.fromObject(object.read_lists[keys[i]]);
                        }
                    }
                    if (object.desc_text) {
                        if (typeof object.desc_text !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.desc_text: object expected");
                        message.desc_text = {};
                        for (let keys = Object.keys(object.desc_text), i = 0; i < keys.length; ++i) {
                            if (typeof object.desc_text[keys[i]] !== "object")
                                throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.desc_text: object expected");
                            message.desc_text[keys[i]] = $root.Protocols.Protobuf.PBClass.desc.fromObject(object.desc_text[keys[i]]);
                        }
                    }
                    if (object.notpull_threshold != null)
                        message.notpull_threshold = object.notpull_threshold >>> 0;
                    if (object.first_message) {
                        if (typeof object.first_message !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PullMessage.first_message: object expected");
                        message.first_message = {};
                        for (let keys = Object.keys(object.first_message), i = 0; i < keys.length; ++i)
                            if (typeof object.first_message[keys[i]] === "string")
                                $util.base64.decode(object.first_message[keys[i]], message.first_message[keys[i]] = $util.newBuffer($util.base64.length(object.first_message[keys[i]])), 0);
                            else if (object.first_message[keys[i]].length >= 0)
                                message.first_message[keys[i]] = object.first_message[keys[i]];
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a PullMessage message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {Protocols.Protobuf.PBClass.PullMessage} message PullMessage
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                PullMessage.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.no_display = [];
                    if (options.objects || options.defaults) {
                        object.descs = {};
                        object.channel_data = {};
                        object.reactions = {};
                        object.up_last = {};
                        object.read_lists = {};
                        object.desc_text = {};
                        object.first_message = {};
                    }
                    if (options.defaults) {
                        object.ack = 0;
                        object.t = 0;
                        object.pull_time = 0;
                        object.seq = 0;
                        object.clean = 0;
                        object.notpull_threshold = 0;
                    }
                    if (message.ack != null && message.hasOwnProperty("ack"))
                        object.ack = message.ack;
                    if (message.t != null && message.hasOwnProperty("t"))
                        object.t = message.t;
                    if (message.pull_time != null && message.hasOwnProperty("pull_time"))
                        object.pull_time = message.pull_time;
                    if (message.no_display && message.no_display.length) {
                        object.no_display = [];
                        for (let j = 0; j < message.no_display.length; ++j)
                            if (typeof message.no_display[j] === "number")
                                object.no_display[j] = options.longs === String ? String(message.no_display[j]) : message.no_display[j];
                            else
                                object.no_display[j] = options.longs === String ? $util.Long.prototype.toString.call(message.no_display[j]) : options.longs === Number ? new $util.LongBits(message.no_display[j].low >>> 0, message.no_display[j].high >>> 0).toNumber() : message.no_display[j];
                    }
                    let keys2;
                    if (message.descs && (keys2 = Object.keys(message.descs)).length) {
                        object.descs = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.descs[keys2[j]] = message.descs[keys2[j]];
                    }
                    if (message.channel_data && (keys2 = Object.keys(message.channel_data)).length) {
                        object.channel_data = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.channel_data[keys2[j]] = $root.Protocols.Protobuf.PBClass.ChannelMessageData.toObject(message.channel_data[keys2[j]], options);
                    }
                    if (message.seq != null && message.hasOwnProperty("seq"))
                        object.seq = message.seq;
                    if (message.clean != null && message.hasOwnProperty("clean"))
                        object.clean = message.clean;
                    if (message.reactions && (keys2 = Object.keys(message.reactions)).length) {
                        object.reactions = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.reactions[keys2[j]] = $root.Protocols.Protobuf.PBClass.ReactionInfo.toObject(message.reactions[keys2[j]], options);
                    }
                    if (message.up_last && (keys2 = Object.keys(message.up_last)).length) {
                        object.up_last = {};
                        for (let j = 0; j < keys2.length; ++j)
                            if (typeof message.up_last[keys2[j]] === "number")
                                object.up_last[keys2[j]] = options.longs === String ? String(message.up_last[keys2[j]]) : message.up_last[keys2[j]];
                            else
                                object.up_last[keys2[j]] = options.longs === String ? $util.Long.prototype.toString.call(message.up_last[keys2[j]]) : options.longs === Number ? new $util.LongBits(message.up_last[keys2[j]].low >>> 0, message.up_last[keys2[j]].high >>> 0).toNumber() : message.up_last[keys2[j]];
                    }
                    if (message.read_lists && (keys2 = Object.keys(message.read_lists)).length) {
                        object.read_lists = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.read_lists[keys2[j]] = $root.Protocols.Protobuf.PBClass.ReadChannelList.toObject(message.read_lists[keys2[j]], options);
                    }
                    if (message.desc_text && (keys2 = Object.keys(message.desc_text)).length) {
                        object.desc_text = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.desc_text[keys2[j]] = $root.Protocols.Protobuf.PBClass.desc.toObject(message.desc_text[keys2[j]], options);
                    }
                    if (message.notpull_threshold != null && message.hasOwnProperty("notpull_threshold"))
                        object.notpull_threshold = message.notpull_threshold;
                    if (message.first_message && (keys2 = Object.keys(message.first_message)).length) {
                        object.first_message = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.first_message[keys2[j]] = options.bytes === String ? $util.base64.encode(message.first_message[keys2[j]], 0, message.first_message[keys2[j]].length) : options.bytes === Array ? Array.prototype.slice.call(message.first_message[keys2[j]]) : message.first_message[keys2[j]];
                    }
                    return object;
                };

                /**
                 * Converts this PullMessage to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                PullMessage.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for PullMessage
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.PullMessage
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                PullMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.PullMessage";
                };

                return PullMessage;
            })();

            PBClass.desc = (function() {

                /**
                 * Properties of a desc.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface Idesc
                 */

                /**
                 * Constructs a new desc.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a desc.
                 * @implements Idesc
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.Idesc=} [properties] Properties to set
                 */
                function desc(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new desc instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Protocols.Protobuf.PBClass.Idesc=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.desc} desc instance
                 */
                desc.create = function create(properties) {
                    return new desc(properties);
                };

                /**
                 * Encodes the specified desc message. Does not implicitly {@link Protocols.Protobuf.PBClass.desc.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Protocols.Protobuf.PBClass.Idesc} message desc message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                desc.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified desc message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.desc.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Protocols.Protobuf.PBClass.Idesc} message desc message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                desc.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a desc message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.desc} desc
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                desc.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.desc();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a desc message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.desc} desc
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                desc.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a desc message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                desc.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a desc message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.desc} desc
                 */
                desc.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.desc)
                        return object;
                    return new $root.Protocols.Protobuf.PBClass.desc();
                };

                /**
                 * Creates a plain object from a desc message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {Protocols.Protobuf.PBClass.desc} message desc
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                desc.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this desc to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                desc.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for desc
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.desc
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                desc.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.desc";
                };

                return desc;
            })();

            PBClass.PubicPush = (function() {

                /**
                 * Properties of a PubicPush.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IPubicPush
                 * @property {number|null} [channel_id] PubicPush channel_id
                 * @property {number|null} [message_id] PubicPush message_id
                 * @property {number|null} [quote_l1] PubicPush quote_l1
                 * @property {number|null} [quote_l2] PubicPush quote_l2
                 * @property {number|null} [nonce] PubicPush nonce
                 * @property {number|null} [channel_type] PubicPush channel_type
                 * @property {string|null} [content] PubicPush content
                 * @property {number|null} [time] PubicPush time
                 * @property {Array.<number>|null} [mentions] PubicPush mentions
                 * @property {Array.<number>|null} [mention_roles] PubicPush mention_roles
                 * @property {string|null} [extra] PubicPush extra
                 * @property {number|null} [user_id] PubicPush user_id
                 * @property {Protocols.Protobuf.PBClass.IAuthor|null} [author] PubicPush author
                 */

                /**
                 * Constructs a new PubicPush.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents a PubicPush.
                 * @implements IPubicPush
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IPubicPush=} [properties] Properties to set
                 */
                function PubicPush(properties) {
                    this.mentions = [];
                    this.mention_roles = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * PubicPush channel_id.
                 * @member {number} channel_id
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.channel_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush message_id.
                 * @member {number} message_id
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.message_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush quote_l1.
                 * @member {number} quote_l1
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.quote_l1 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush quote_l2.
                 * @member {number} quote_l2
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.quote_l2 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush nonce.
                 * @member {number} nonce
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.nonce = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush channel_type.
                 * @member {number} channel_type
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.channel_type = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush content.
                 * @member {string} content
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.content = "";

                /**
                 * PubicPush time.
                 * @member {number} time
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush mentions.
                 * @member {Array.<number>} mentions
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.mentions = $util.emptyArray;

                /**
                 * PubicPush mention_roles.
                 * @member {Array.<number>} mention_roles
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.mention_roles = $util.emptyArray;

                /**
                 * PubicPush extra.
                 * @member {string} extra
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.extra = "";

                /**
                 * PubicPush user_id.
                 * @member {number} user_id
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.user_id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * PubicPush author.
                 * @member {Protocols.Protobuf.PBClass.IAuthor|null|undefined} author
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 */
                PubicPush.prototype.author = null;

                /**
                 * Creates a new PubicPush instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPubicPush=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.PubicPush} PubicPush instance
                 */
                PubicPush.create = function create(properties) {
                    return new PubicPush(properties);
                };

                /**
                 * Encodes the specified PubicPush message. Does not implicitly {@link Protocols.Protobuf.PBClass.PubicPush.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPubicPush} message PubicPush message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PubicPush.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.channel_id != null && Object.hasOwnProperty.call(message, "channel_id"))
                        writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.channel_id);
                    if (message.message_id != null && Object.hasOwnProperty.call(message, "message_id"))
                        writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.message_id);
                    if (message.quote_l1 != null && Object.hasOwnProperty.call(message, "quote_l1"))
                        writer.uint32(/* id 3, wireType 1 =*/25).fixed64(message.quote_l1);
                    if (message.quote_l2 != null && Object.hasOwnProperty.call(message, "quote_l2"))
                        writer.uint32(/* id 4, wireType 1 =*/33).fixed64(message.quote_l2);
                    if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                        writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.nonce);
                    if (message.channel_type != null && Object.hasOwnProperty.call(message, "channel_type"))
                        writer.uint32(/* id 6, wireType 1 =*/49).fixed64(message.channel_type);
                    if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                        writer.uint32(/* id 7, wireType 2 =*/58).string(message.content);
                    if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                        writer.uint32(/* id 8, wireType 1 =*/65).fixed64(message.time);
                    if (message.mentions != null && message.mentions.length) {
                        writer.uint32(/* id 9, wireType 2 =*/74).fork();
                        for (let i = 0; i < message.mentions.length; ++i)
                            writer.fixed64(message.mentions[i]);
                        writer.ldelim();
                    }
                    if (message.mention_roles != null && message.mention_roles.length) {
                        writer.uint32(/* id 10, wireType 2 =*/82).fork();
                        for (let i = 0; i < message.mention_roles.length; ++i)
                            writer.fixed64(message.mention_roles[i]);
                        writer.ldelim();
                    }
                    if (message.extra != null && Object.hasOwnProperty.call(message, "extra"))
                        writer.uint32(/* id 11, wireType 2 =*/90).string(message.extra);
                    if (message.user_id != null && Object.hasOwnProperty.call(message, "user_id"))
                        writer.uint32(/* id 12, wireType 1 =*/97).fixed64(message.user_id);
                    if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                        $root.Protocols.Protobuf.PBClass.Author.encode(message.author, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified PubicPush message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.PubicPush.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IPubicPush} message PubicPush message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PubicPush.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a PubicPush message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.PubicPush} PubicPush
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PubicPush.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.PubicPush();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.channel_id = reader.fixed64();
                                break;
                            }
                        case 2: {
                                message.message_id = reader.fixed64();
                                break;
                            }
                        case 3: {
                                message.quote_l1 = reader.fixed64();
                                break;
                            }
                        case 4: {
                                message.quote_l2 = reader.fixed64();
                                break;
                            }
                        case 5: {
                                message.nonce = reader.fixed64();
                                break;
                            }
                        case 6: {
                                message.channel_type = reader.fixed64();
                                break;
                            }
                        case 7: {
                                message.content = reader.string();
                                break;
                            }
                        case 8: {
                                message.time = reader.fixed64();
                                break;
                            }
                        case 9: {
                                if (!(message.mentions && message.mentions.length))
                                    message.mentions = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.mentions.push(reader.fixed64());
                                } else
                                    message.mentions.push(reader.fixed64());
                                break;
                            }
                        case 10: {
                                if (!(message.mention_roles && message.mention_roles.length))
                                    message.mention_roles = [];
                                if ((tag & 7) === 2) {
                                    let end2 = reader.uint32() + reader.pos;
                                    while (reader.pos < end2)
                                        message.mention_roles.push(reader.fixed64());
                                } else
                                    message.mention_roles.push(reader.fixed64());
                                break;
                            }
                        case 11: {
                                message.extra = reader.string();
                                break;
                            }
                        case 12: {
                                message.user_id = reader.fixed64();
                                break;
                            }
                        case 13: {
                                message.author = $root.Protocols.Protobuf.PBClass.Author.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a PubicPush message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.PubicPush} PubicPush
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PubicPush.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a PubicPush message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                PubicPush.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                        if (!$util.isInteger(message.channel_id) && !(message.channel_id && $util.isInteger(message.channel_id.low) && $util.isInteger(message.channel_id.high)))
                            return "channel_id: integer|Long expected";
                    if (message.message_id != null && message.hasOwnProperty("message_id"))
                        if (!$util.isInteger(message.message_id) && !(message.message_id && $util.isInteger(message.message_id.low) && $util.isInteger(message.message_id.high)))
                            return "message_id: integer|Long expected";
                    if (message.quote_l1 != null && message.hasOwnProperty("quote_l1"))
                        if (!$util.isInteger(message.quote_l1) && !(message.quote_l1 && $util.isInteger(message.quote_l1.low) && $util.isInteger(message.quote_l1.high)))
                            return "quote_l1: integer|Long expected";
                    if (message.quote_l2 != null && message.hasOwnProperty("quote_l2"))
                        if (!$util.isInteger(message.quote_l2) && !(message.quote_l2 && $util.isInteger(message.quote_l2.low) && $util.isInteger(message.quote_l2.high)))
                            return "quote_l2: integer|Long expected";
                    if (message.nonce != null && message.hasOwnProperty("nonce"))
                        if (!$util.isInteger(message.nonce) && !(message.nonce && $util.isInteger(message.nonce.low) && $util.isInteger(message.nonce.high)))
                            return "nonce: integer|Long expected";
                    if (message.channel_type != null && message.hasOwnProperty("channel_type"))
                        if (!$util.isInteger(message.channel_type) && !(message.channel_type && $util.isInteger(message.channel_type.low) && $util.isInteger(message.channel_type.high)))
                            return "channel_type: integer|Long expected";
                    if (message.content != null && message.hasOwnProperty("content"))
                        if (!$util.isString(message.content))
                            return "content: string expected";
                    if (message.time != null && message.hasOwnProperty("time"))
                        if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                            return "time: integer|Long expected";
                    if (message.mentions != null && message.hasOwnProperty("mentions")) {
                        if (!Array.isArray(message.mentions))
                            return "mentions: array expected";
                        for (let i = 0; i < message.mentions.length; ++i)
                            if (!$util.isInteger(message.mentions[i]) && !(message.mentions[i] && $util.isInteger(message.mentions[i].low) && $util.isInteger(message.mentions[i].high)))
                                return "mentions: integer|Long[] expected";
                    }
                    if (message.mention_roles != null && message.hasOwnProperty("mention_roles")) {
                        if (!Array.isArray(message.mention_roles))
                            return "mention_roles: array expected";
                        for (let i = 0; i < message.mention_roles.length; ++i)
                            if (!$util.isInteger(message.mention_roles[i]) && !(message.mention_roles[i] && $util.isInteger(message.mention_roles[i].low) && $util.isInteger(message.mention_roles[i].high)))
                                return "mention_roles: integer|Long[] expected";
                    }
                    if (message.extra != null && message.hasOwnProperty("extra"))
                        if (!$util.isString(message.extra))
                            return "extra: string expected";
                    if (message.user_id != null && message.hasOwnProperty("user_id"))
                        if (!$util.isInteger(message.user_id) && !(message.user_id && $util.isInteger(message.user_id.low) && $util.isInteger(message.user_id.high)))
                            return "user_id: integer|Long expected";
                    if (message.author != null && message.hasOwnProperty("author")) {
                        let error = $root.Protocols.Protobuf.PBClass.Author.verify(message.author);
                        if (error)
                            return "author." + error;
                    }
                    return null;
                };

                /**
                 * Creates a PubicPush message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.PubicPush} PubicPush
                 */
                PubicPush.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.PubicPush)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.PubicPush();
                    if (object.channel_id != null)
                        if ($util.Long)
                            (message.channel_id = $util.Long.fromValue(object.channel_id)).unsigned = false;
                        else if (typeof object.channel_id === "string")
                            message.channel_id = parseInt(object.channel_id, 10);
                        else if (typeof object.channel_id === "number")
                            message.channel_id = object.channel_id;
                        else if (typeof object.channel_id === "object")
                            message.channel_id = new $util.LongBits(object.channel_id.low >>> 0, object.channel_id.high >>> 0).toNumber();
                    if (object.message_id != null)
                        if ($util.Long)
                            (message.message_id = $util.Long.fromValue(object.message_id)).unsigned = false;
                        else if (typeof object.message_id === "string")
                            message.message_id = parseInt(object.message_id, 10);
                        else if (typeof object.message_id === "number")
                            message.message_id = object.message_id;
                        else if (typeof object.message_id === "object")
                            message.message_id = new $util.LongBits(object.message_id.low >>> 0, object.message_id.high >>> 0).toNumber();
                    if (object.quote_l1 != null)
                        if ($util.Long)
                            (message.quote_l1 = $util.Long.fromValue(object.quote_l1)).unsigned = false;
                        else if (typeof object.quote_l1 === "string")
                            message.quote_l1 = parseInt(object.quote_l1, 10);
                        else if (typeof object.quote_l1 === "number")
                            message.quote_l1 = object.quote_l1;
                        else if (typeof object.quote_l1 === "object")
                            message.quote_l1 = new $util.LongBits(object.quote_l1.low >>> 0, object.quote_l1.high >>> 0).toNumber();
                    if (object.quote_l2 != null)
                        if ($util.Long)
                            (message.quote_l2 = $util.Long.fromValue(object.quote_l2)).unsigned = false;
                        else if (typeof object.quote_l2 === "string")
                            message.quote_l2 = parseInt(object.quote_l2, 10);
                        else if (typeof object.quote_l2 === "number")
                            message.quote_l2 = object.quote_l2;
                        else if (typeof object.quote_l2 === "object")
                            message.quote_l2 = new $util.LongBits(object.quote_l2.low >>> 0, object.quote_l2.high >>> 0).toNumber();
                    if (object.nonce != null)
                        if ($util.Long)
                            (message.nonce = $util.Long.fromValue(object.nonce)).unsigned = false;
                        else if (typeof object.nonce === "string")
                            message.nonce = parseInt(object.nonce, 10);
                        else if (typeof object.nonce === "number")
                            message.nonce = object.nonce;
                        else if (typeof object.nonce === "object")
                            message.nonce = new $util.LongBits(object.nonce.low >>> 0, object.nonce.high >>> 0).toNumber();
                    if (object.channel_type != null)
                        if ($util.Long)
                            (message.channel_type = $util.Long.fromValue(object.channel_type)).unsigned = false;
                        else if (typeof object.channel_type === "string")
                            message.channel_type = parseInt(object.channel_type, 10);
                        else if (typeof object.channel_type === "number")
                            message.channel_type = object.channel_type;
                        else if (typeof object.channel_type === "object")
                            message.channel_type = new $util.LongBits(object.channel_type.low >>> 0, object.channel_type.high >>> 0).toNumber();
                    if (object.content != null)
                        message.content = String(object.content);
                    if (object.time != null)
                        if ($util.Long)
                            (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                        else if (typeof object.time === "string")
                            message.time = parseInt(object.time, 10);
                        else if (typeof object.time === "number")
                            message.time = object.time;
                        else if (typeof object.time === "object")
                            message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
                    if (object.mentions) {
                        if (!Array.isArray(object.mentions))
                            throw TypeError(".Protocols.Protobuf.PBClass.PubicPush.mentions: array expected");
                        message.mentions = [];
                        for (let i = 0; i < object.mentions.length; ++i)
                            if ($util.Long)
                                (message.mentions[i] = $util.Long.fromValue(object.mentions[i])).unsigned = false;
                            else if (typeof object.mentions[i] === "string")
                                message.mentions[i] = parseInt(object.mentions[i], 10);
                            else if (typeof object.mentions[i] === "number")
                                message.mentions[i] = object.mentions[i];
                            else if (typeof object.mentions[i] === "object")
                                message.mentions[i] = new $util.LongBits(object.mentions[i].low >>> 0, object.mentions[i].high >>> 0).toNumber();
                    }
                    if (object.mention_roles) {
                        if (!Array.isArray(object.mention_roles))
                            throw TypeError(".Protocols.Protobuf.PBClass.PubicPush.mention_roles: array expected");
                        message.mention_roles = [];
                        for (let i = 0; i < object.mention_roles.length; ++i)
                            if ($util.Long)
                                (message.mention_roles[i] = $util.Long.fromValue(object.mention_roles[i])).unsigned = false;
                            else if (typeof object.mention_roles[i] === "string")
                                message.mention_roles[i] = parseInt(object.mention_roles[i], 10);
                            else if (typeof object.mention_roles[i] === "number")
                                message.mention_roles[i] = object.mention_roles[i];
                            else if (typeof object.mention_roles[i] === "object")
                                message.mention_roles[i] = new $util.LongBits(object.mention_roles[i].low >>> 0, object.mention_roles[i].high >>> 0).toNumber();
                    }
                    if (object.extra != null)
                        message.extra = String(object.extra);
                    if (object.user_id != null)
                        if ($util.Long)
                            (message.user_id = $util.Long.fromValue(object.user_id)).unsigned = false;
                        else if (typeof object.user_id === "string")
                            message.user_id = parseInt(object.user_id, 10);
                        else if (typeof object.user_id === "number")
                            message.user_id = object.user_id;
                        else if (typeof object.user_id === "object")
                            message.user_id = new $util.LongBits(object.user_id.low >>> 0, object.user_id.high >>> 0).toNumber();
                    if (object.author != null) {
                        if (typeof object.author !== "object")
                            throw TypeError(".Protocols.Protobuf.PBClass.PubicPush.author: object expected");
                        message.author = $root.Protocols.Protobuf.PBClass.Author.fromObject(object.author);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a PubicPush message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {Protocols.Protobuf.PBClass.PubicPush} message PubicPush
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                PubicPush.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.mentions = [];
                        object.mention_roles = [];
                    }
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.channel_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.channel_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.message_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.message_id = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.quote_l1 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.quote_l1 = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.quote_l2 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.quote_l2 = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.nonce = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.nonce = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.channel_type = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.channel_type = options.longs === String ? "0" : 0;
                        object.content = "";
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.time = options.longs === String ? "0" : 0;
                        object.extra = "";
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.user_id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.user_id = options.longs === String ? "0" : 0;
                        object.author = null;
                    }
                    if (message.channel_id != null && message.hasOwnProperty("channel_id"))
                        if (typeof message.channel_id === "number")
                            object.channel_id = options.longs === String ? String(message.channel_id) : message.channel_id;
                        else
                            object.channel_id = options.longs === String ? $util.Long.prototype.toString.call(message.channel_id) : options.longs === Number ? new $util.LongBits(message.channel_id.low >>> 0, message.channel_id.high >>> 0).toNumber() : message.channel_id;
                    if (message.message_id != null && message.hasOwnProperty("message_id"))
                        if (typeof message.message_id === "number")
                            object.message_id = options.longs === String ? String(message.message_id) : message.message_id;
                        else
                            object.message_id = options.longs === String ? $util.Long.prototype.toString.call(message.message_id) : options.longs === Number ? new $util.LongBits(message.message_id.low >>> 0, message.message_id.high >>> 0).toNumber() : message.message_id;
                    if (message.quote_l1 != null && message.hasOwnProperty("quote_l1"))
                        if (typeof message.quote_l1 === "number")
                            object.quote_l1 = options.longs === String ? String(message.quote_l1) : message.quote_l1;
                        else
                            object.quote_l1 = options.longs === String ? $util.Long.prototype.toString.call(message.quote_l1) : options.longs === Number ? new $util.LongBits(message.quote_l1.low >>> 0, message.quote_l1.high >>> 0).toNumber() : message.quote_l1;
                    if (message.quote_l2 != null && message.hasOwnProperty("quote_l2"))
                        if (typeof message.quote_l2 === "number")
                            object.quote_l2 = options.longs === String ? String(message.quote_l2) : message.quote_l2;
                        else
                            object.quote_l2 = options.longs === String ? $util.Long.prototype.toString.call(message.quote_l2) : options.longs === Number ? new $util.LongBits(message.quote_l2.low >>> 0, message.quote_l2.high >>> 0).toNumber() : message.quote_l2;
                    if (message.nonce != null && message.hasOwnProperty("nonce"))
                        if (typeof message.nonce === "number")
                            object.nonce = options.longs === String ? String(message.nonce) : message.nonce;
                        else
                            object.nonce = options.longs === String ? $util.Long.prototype.toString.call(message.nonce) : options.longs === Number ? new $util.LongBits(message.nonce.low >>> 0, message.nonce.high >>> 0).toNumber() : message.nonce;
                    if (message.channel_type != null && message.hasOwnProperty("channel_type"))
                        if (typeof message.channel_type === "number")
                            object.channel_type = options.longs === String ? String(message.channel_type) : message.channel_type;
                        else
                            object.channel_type = options.longs === String ? $util.Long.prototype.toString.call(message.channel_type) : options.longs === Number ? new $util.LongBits(message.channel_type.low >>> 0, message.channel_type.high >>> 0).toNumber() : message.channel_type;
                    if (message.content != null && message.hasOwnProperty("content"))
                        object.content = message.content;
                    if (message.time != null && message.hasOwnProperty("time"))
                        if (typeof message.time === "number")
                            object.time = options.longs === String ? String(message.time) : message.time;
                        else
                            object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
                    if (message.mentions && message.mentions.length) {
                        object.mentions = [];
                        for (let j = 0; j < message.mentions.length; ++j)
                            if (typeof message.mentions[j] === "number")
                                object.mentions[j] = options.longs === String ? String(message.mentions[j]) : message.mentions[j];
                            else
                                object.mentions[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mentions[j]) : options.longs === Number ? new $util.LongBits(message.mentions[j].low >>> 0, message.mentions[j].high >>> 0).toNumber() : message.mentions[j];
                    }
                    if (message.mention_roles && message.mention_roles.length) {
                        object.mention_roles = [];
                        for (let j = 0; j < message.mention_roles.length; ++j)
                            if (typeof message.mention_roles[j] === "number")
                                object.mention_roles[j] = options.longs === String ? String(message.mention_roles[j]) : message.mention_roles[j];
                            else
                                object.mention_roles[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mention_roles[j]) : options.longs === Number ? new $util.LongBits(message.mention_roles[j].low >>> 0, message.mention_roles[j].high >>> 0).toNumber() : message.mention_roles[j];
                    }
                    if (message.extra != null && message.hasOwnProperty("extra"))
                        object.extra = message.extra;
                    if (message.user_id != null && message.hasOwnProperty("user_id"))
                        if (typeof message.user_id === "number")
                            object.user_id = options.longs === String ? String(message.user_id) : message.user_id;
                        else
                            object.user_id = options.longs === String ? $util.Long.prototype.toString.call(message.user_id) : options.longs === Number ? new $util.LongBits(message.user_id.low >>> 0, message.user_id.high >>> 0).toNumber() : message.user_id;
                    if (message.author != null && message.hasOwnProperty("author"))
                        object.author = $root.Protocols.Protobuf.PBClass.Author.toObject(message.author, options);
                    return object;
                };

                /**
                 * Converts this PubicPush to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                PubicPush.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for PubicPush
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.PubicPush
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                PubicPush.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.PubicPush";
                };

                return PubicPush;
            })();

            PBClass.Author = (function() {

                /**
                 * Properties of an Author.
                 * @memberof Protocols.Protobuf.PBClass
                 * @interface IAuthor
                 * @property {string|null} [nickname] Author nickname
                 * @property {string|null} [username] Author username
                 * @property {string|null} [avatar] Author avatar
                 * @property {string|null} [avatar_nft] Author avatar_nft
                 * @property {boolean|null} [bot] Author bot
                 */

                /**
                 * Constructs a new Author.
                 * @memberof Protocols.Protobuf.PBClass
                 * @classdesc Represents an Author.
                 * @implements IAuthor
                 * @constructor
                 * @param {Protocols.Protobuf.PBClass.IAuthor=} [properties] Properties to set
                 */
                function Author(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Author nickname.
                 * @member {string} nickname
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 */
                Author.prototype.nickname = "";

                /**
                 * Author username.
                 * @member {string} username
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 */
                Author.prototype.username = "";

                /**
                 * Author avatar.
                 * @member {string} avatar
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 */
                Author.prototype.avatar = "";

                /**
                 * Author avatar_nft.
                 * @member {string} avatar_nft
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 */
                Author.prototype.avatar_nft = "";

                /**
                 * Author bot.
                 * @member {boolean} bot
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 */
                Author.prototype.bot = false;

                /**
                 * Creates a new Author instance using the specified properties.
                 * @function create
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IAuthor=} [properties] Properties to set
                 * @returns {Protocols.Protobuf.PBClass.Author} Author instance
                 */
                Author.create = function create(properties) {
                    return new Author(properties);
                };

                /**
                 * Encodes the specified Author message. Does not implicitly {@link Protocols.Protobuf.PBClass.Author.verify|verify} messages.
                 * @function encode
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IAuthor} message Author message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Author.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.nickname != null && Object.hasOwnProperty.call(message, "nickname"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.nickname);
                    if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                    if (message.avatar != null && Object.hasOwnProperty.call(message, "avatar"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.avatar);
                    if (message.avatar_nft != null && Object.hasOwnProperty.call(message, "avatar_nft"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.avatar_nft);
                    if (message.bot != null && Object.hasOwnProperty.call(message, "bot"))
                        writer.uint32(/* id 5, wireType 0 =*/40).bool(message.bot);
                    return writer;
                };

                /**
                 * Encodes the specified Author message, length delimited. Does not implicitly {@link Protocols.Protobuf.PBClass.Author.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Protocols.Protobuf.PBClass.IAuthor} message Author message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Author.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Author message from the specified reader or buffer.
                 * @function decode
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {Protocols.Protobuf.PBClass.Author} Author
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Author.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Protocols.Protobuf.PBClass.Author();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.nickname = reader.string();
                                break;
                            }
                        case 2: {
                                message.username = reader.string();
                                break;
                            }
                        case 3: {
                                message.avatar = reader.string();
                                break;
                            }
                        case 4: {
                                message.avatar_nft = reader.string();
                                break;
                            }
                        case 5: {
                                message.bot = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Author message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {Protocols.Protobuf.PBClass.Author} Author
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Author.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Author message.
                 * @function verify
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Author.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.nickname != null && message.hasOwnProperty("nickname"))
                        if (!$util.isString(message.nickname))
                            return "nickname: string expected";
                    if (message.username != null && message.hasOwnProperty("username"))
                        if (!$util.isString(message.username))
                            return "username: string expected";
                    if (message.avatar != null && message.hasOwnProperty("avatar"))
                        if (!$util.isString(message.avatar))
                            return "avatar: string expected";
                    if (message.avatar_nft != null && message.hasOwnProperty("avatar_nft"))
                        if (!$util.isString(message.avatar_nft))
                            return "avatar_nft: string expected";
                    if (message.bot != null && message.hasOwnProperty("bot"))
                        if (typeof message.bot !== "boolean")
                            return "bot: boolean expected";
                    return null;
                };

                /**
                 * Creates an Author message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {Protocols.Protobuf.PBClass.Author} Author
                 */
                Author.fromObject = function fromObject(object) {
                    if (object instanceof $root.Protocols.Protobuf.PBClass.Author)
                        return object;
                    let message = new $root.Protocols.Protobuf.PBClass.Author();
                    if (object.nickname != null)
                        message.nickname = String(object.nickname);
                    if (object.username != null)
                        message.username = String(object.username);
                    if (object.avatar != null)
                        message.avatar = String(object.avatar);
                    if (object.avatar_nft != null)
                        message.avatar_nft = String(object.avatar_nft);
                    if (object.bot != null)
                        message.bot = Boolean(object.bot);
                    return message;
                };

                /**
                 * Creates a plain object from an Author message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {Protocols.Protobuf.PBClass.Author} message Author
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Author.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.nickname = "";
                        object.username = "";
                        object.avatar = "";
                        object.avatar_nft = "";
                        object.bot = false;
                    }
                    if (message.nickname != null && message.hasOwnProperty("nickname"))
                        object.nickname = message.nickname;
                    if (message.username != null && message.hasOwnProperty("username"))
                        object.username = message.username;
                    if (message.avatar != null && message.hasOwnProperty("avatar"))
                        object.avatar = message.avatar;
                    if (message.avatar_nft != null && message.hasOwnProperty("avatar_nft"))
                        object.avatar_nft = message.avatar_nft;
                    if (message.bot != null && message.hasOwnProperty("bot"))
                        object.bot = message.bot;
                    return object;
                };

                /**
                 * Converts this Author to JSON.
                 * @function toJSON
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Author.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Author
                 * @function getTypeUrl
                 * @memberof Protocols.Protobuf.PBClass.Author
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Author.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/Protocols.Protobuf.PBClass.Author";
                };

                return Author;
            })();

            return PBClass;
        })();

        return Protobuf;
    })();

    return Protocols;
})();

export { $root as default };
