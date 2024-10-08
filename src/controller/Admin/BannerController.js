import Banner from "../../models/Banner.js";
import { handleErrorResponse } from "../../services/CommonService.js";
import { createBannerCsv } from "../../utils/CsvFile.js";
import { ResponseMessage } from "../../utils/ResponseMessage.js";
import StatusCodes from "http-status-codes";

export const addEditBanner = async (req, res) => {
  try {
    let { id, bannerName, description, bannerType, platformType } = req.body;

    let exist = await Banner.findOne({
      bannerName,
      isDeleted: false,
    });

    if (exist && !id) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.BANNER_ALREADY_CREATED,
        data: [],
      });
    } else if (id) {
      let already = await Banner.findOne({
        _id: { $ne: id },
        bannerName,
        isDeleted: false,
      });

      if (already) {
        return res.status(409).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.BANNER_ALREADY_CREATED,
          data: [],
        });
      } else {
        if (req.file) {
          req.body.OldImageFile = req.body.bannerImage;
          req.body.bannerImage = req.file.filename;
        }
        let updateBanner = await Banner.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              bannerName,
              description,
              bannerType,
              platformType,
              bannerImage: req.body.bannerImage,
            },
          },
          { new: true }
        );
        if (!updateBanner) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        } else {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.MOVIESLIDER_UPDATED,
            data: updateBanner,
          });
        }
      }
    } else {
      if (req.file) {
        req.body.OldImageFile = req.body.bannerImage;
        req.body.bannerImage = req.file.filename;
      }
      const newBanner = new Banner({
        bannerName,
        platformType,
        bannerType,
        bannerImage: req.body.bannerImage,
        description,
      });

      const saveBanner = await newBanner.save();
      if (!saveBanner) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.BANNER_CREATED,
          data: saveBanner,
        });
      }
    }
  } catch (err) {
    return handleErrorResponse(res, err);
  }
};

export const getAllBanner = async (req, res) => {
  try {
    const data = await Banner.find({ isDeleted: false })
      .select(
        "bannerName description isActive bannerImage bannerType platformType createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: ResponseMessage.ALL_BANNER,
      data,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const removeBanner = async (req, res) => {
  try {
    let { id } = req.query;
    await Banner.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isDeleted: true,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BANNER_REMOVED,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getSingleBanner = async (req, res) => {
  try {
    let { id } = req.query;
    const data = await Banner.findOne({ _id: id });
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BANNER_DETAILS,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const bannerActiveDeActiveStatus = async (req, res) => {
  try {
    const banner = await Banner.findOne({ _id: req.body.id });
    if (!banner) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.BANNER_NOT_FOUND,
      });
    } else {
      const newActiveStatus = !banner.isActive;

      const updatedBanner = await Banner.updateOne(
        { _id: req.body.id },
        { $set: { isActive: newActiveStatus } },
        { new: true }
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: !newActiveStatus
          ? ResponseMessage.BANNER_DEACTIVE
          : ResponseMessage.BANNER_ACTIVE,
        data: updatedBanner,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const bannerListingsToCSVExport = async (req, res) => {
  try {
    const expertData = await Banner.find({}).sort({ createdAt: -1 });

    let result = await createBannerCsv(expertData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${"expert_listings.csv"}`
    );
    res.send(result);
  } catch (error) {
    console.error("Error exporting job listings to CSV:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
